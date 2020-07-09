import { Client, Intents } from 'discord.js';
import Database from '../structures/Database';
import Logger from '../util/logger';
import CommandHandler from '../handlers/CommandHandler';
import MuteSchedule from '../schedules/Mute';
import GiveawaySchedule from '../schedules/Giveaway';
import { once } from 'events';
import Util from '../util';
import HavocGuild from '../structures/extensions/HavocGuild';
import EventHandler from '../handlers/EventHandler';
import { WEEKS, GUILD_CONFIGS } from '../util/CONSTANTS';
import Prometheus from '../structures/Prometheus';
import GuildEntity from '../structures/entities/GuildEntity';

export default class Havoc extends Client {
  initialised = false;

  logger = Logger;

  db = new Database(this);

  prometheus = new Prometheus(this);

  commandHandler = new CommandHandler(this);

  eventHandler = new EventHandler(this);

  schedules = {
    mute: new MuteSchedule(this),
    giveaway: new GiveawaySchedule(this),
  };

  blacklisted: Record<'commands' | 'users' | 'guilds', Set<string>> = {
    users: new Set(),
    guilds: new Set(),
    commands: new Set(),
  };

  guildConfigs: Map<
    HavocGuild['id'],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { [key in GUILD_CONFIGS]?: any }
  > = new Map();

  constructor() {
    super({
      ws: {
        intents:
          Intents.ALL &
          ~(
            Intents.FLAGS.GUILD_INTEGRATIONS |
            Intents.FLAGS.GUILD_WEBHOOKS |
            Intents.FLAGS.GUILD_INVITES |
            Intents.FLAGS.GUILD_PRESENCES |
            Intents.FLAGS.GUILD_MESSAGE_TYPING |
            Intents.FLAGS.DIRECT_MESSAGE_TYPING
          ),
      },
    });
    this.init();
  }

  get totalMemberCount() {
    return this.guilds.cache.reduce(
      (total, guild) => total + guild.memberCount,
      0
    );
  }

  async init() {
    await this.db
      .init()
      .catch((error) =>
        this.logger.error(error.message, { origin: 'Database#init()' })
      );
    await once(this, 'ready');

    this.prometheus.guildGauge.set(this.guilds.cache.size);
    this.prometheus.userGauge.set(this.totalMemberCount);

    const schedules = Object.values(this.schedules);
    await Promise.all(schedules.map((schedule) => schedule.init())).then(
      () =>
        this.logger.info(
          `Initialised ${schedules.length} ${Util.plural(
            'schedule',
            schedules.length
          )}`,
          { origin: 'Schedule#init()' }
        ),
      (error) => this.logger.error(error.message, { origin: 'Havoc#init()' })
    );

    const guilds = await this.db.guildRepo.findAll({ populate: ['tags'] });
    await Promise.all(
      guilds.map(
        async (
          guildEntity: { [key in keyof GuildEntity]: GuildEntity[key] }
        ) => {
          const guild = this.guilds.cache.get(guildEntity.id) as HavocGuild;
          if (!guild) {
            if (
              guildEntity.deletedAt &&
              guildEntity.deletedAt > new Date(Date.now() + WEEKS(2))
            )
              return this.db.guildRepo.removeAndFlush(guildEntity);
            return;
          }
          const setableConfigs = Object.keys(GUILD_CONFIGS).filter(
            (config) => config !== GUILD_CONFIGS.tags
          ) as (keyof GuildEntity)[];

          this.guildConfigs.set(
            guild.id,
            Object.fromEntries(
              setableConfigs
                .filter((setableConfig) => guildEntity[setableConfig])
                .map((config) => [config, guildEntity[config]])
            )
          );

          if (guildEntity.tags && guildEntity.tags.count()) {
            await guildEntity.tags.init();
            guild.setConfig(
              GUILD_CONFIGS.tags,
              new Map(
                guildEntity.tags
                  .getItems()
                  .map(({ name, content }) => [name, content])
              )
            );
          }
        }
      )
    );

    this.initialised = true;
  }
}
