import { Client } from 'discord.js';
import Database from '../structures/Database';
import Logger from '../util/logger';
import CommandHandler from '../handlers/CommandHandler';
import MuteSchedule from '../schedules/Mute';
import GiveawaySchedule from '../schedules/Giveaway';
import { once } from 'events';
import Util from '../util';
import HavocGuild from '../structures/extensions/HavocGuild';
import EventHandler from '../handlers/EventHandler';
import { WEEKS } from '../util/CONSTANTS';

export default class Havoc extends Client {
  initialised = false;

  logger = Logger;

  db = new Database(this);

  commandHandler = new CommandHandler(this);

  eventHandler = new EventHandler(this);

  schedules = {
    mute: new MuteSchedule(this),
    giveaway: new GiveawaySchedule(this)
  };

  constructor(options = {}) {
    super(options);
    this.init();
  }

  async init() {
    await this.db
      .init()
      .catch(error =>
        this.logger.error(error.message, { origin: 'Database#init()' })
      );
    await once(this, 'ready');

    const schedules = Object.values(this.schedules);
    await Promise.all(schedules.map(schedule => schedule.init())).then(
      () =>
        this.logger.info(
          `Initialised ${schedules.length} ${Util.plural(
            'schedule',
            schedules.length
          )}`,
          { origin: 'Schedule#init()' }
        ),
      error => this.logger.error(error.message, { origin: 'Havoc#init()' })
    );

    const guilds = await this.db.guildRepo.findAll({ populate: ['tags'] });
    await Promise.all(
      guilds.map(async guildEntity => {
        const guild = this.guilds.cache.get(guildEntity.id) as HavocGuild;
        if (!guild) {
          if (
            guildEntity.deletedAt &&
            guildEntity.deletedAt > new Date(Date.now() + WEEKS(2))
          )
            return this.db.guildRepo.removeAndFlush(guildEntity);
          return;
        }

        Util.truthyObjMerge(
          guild,
          guildEntity,
          'logs',
          'prefix',
          'bcPrefixes',
          'welcomer',
          'autorole'
        );

        if (guildEntity.tags && guildEntity.tags.count()) {
          await guildEntity.tags.init();
          guildEntity.tags
            .getItems()
            .forEach(({ name, content }) => guild.tags.set(name, content));
        }
      })
    );

    this.initialised = true;
  }
}
