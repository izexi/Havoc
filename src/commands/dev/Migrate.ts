/* eslint-disable @typescript-eslint/no-explicit-any */
import Command from '../../structures/bases/Command';
import fetch from 'node-fetch';
import { Collection } from 'discord.js';
import GuildEntity from '../../structures/entities/GuildEntity';
import TagEntity from '../../structures/entities/TagEntity';
import WarnEntity from '../../structures/entities/WarnEntity';
import UserEntity from '../../structures/entities/UserEntity';
import Havoc from '../../client/Havoc';
import MuteEntity from '../../structures/entities/MuteEntity';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { Target } from '../../util/targetter';
import { PROMPT_ENTER, MINUTES, EMOJIS } from '../../util/CONSTANTS';
import WarnPunishmentEntity from '../../structures/entities/WarnPunishmentEntity';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: 'Migrate old database.',
      args: {
        type: Target.TEXT,
        required: true,
        prompt: PROMPT_ENTER('the dump URL.')
      }
    });
  }

  async run(
    this: Havoc,
    { message, text }: { message: HavocMessage; text: string }
  ) {
    const status = await message.channel.send(`Migrating... ${EMOJIS.LOADING}`);
    const dump = await fetch(text).then(r => r.text());
    const mappedDump: Collection<string, any> = dump
      .split('\n')
      .reduce((col, d) => {
        const [k, v] = d.split('\t');
        return col.set(k, JSON.parse(v));
      }, new Collection() as Collection<string, any>);
    let i = 0;

    for (const [key, data] of mappedDump) {
      const [type, id] = key.split(':');
      const opts: any = {};

      switch (type) {
        case 'config':
          {
            if (data.prefix) opts.prefix = data.prefix;
            if (data.welcomer) opts.welcomer = data.welcomer;
            if (data.suggestion?.channel)
              opts.suggestion = data.suggestion.channel;
            if (data.giveaway?.channel) opts.giveaway = data.giveaway.channel;
            if (data.autorole) opts.autorole = data.autorole;
            if (data.modlogs) opts.modlogs = data.modlogs;
            if (data.bcPrefixes) opts.bcPrefixes = data.bcPrefixes;
            if (data.logs) {
              const logs: any = { channel: data.logs };
              const webhook = mappedDump.get(`webhook:${id}`);
              if (webhook) {
                opts.logs = {
                  ...logs,
                  webhook,
                  disabled: mappedDump.get(`disabledLogs:${id}`) || []
                };
              }
            }

            await this.db.upsert(GuildEntity, id, opts);
            const guildEntity = await this.db.findOrInsert(GuildEntity, id);

            if (data.punishments) {
              await guildEntity.warnPunishments.init();
              const entries = Object.entries(data.punishments);
              if (
                entries.every(
                  ([p, w]) =>
                    Number(p) && /^(mute \d+|kick|ban)/.test(w as string)
                )
              ) {
                guildEntity.warnPunishments.add(
                  ...entries.map(([p, w]) => {
                    const [punishment, duration] = (w as string).split(' ');
                    return new WarnPunishmentEntity({
                      amount: Number(p),
                      punishment,
                      duration:
                        punishment === 'mute'
                          ? MINUTES(Number(duration))
                          : undefined
                    });
                  })
                );
              }
            }

            const tags = mappedDump.filter(
              (v, k) => k.startsWith('tags') && v.guild === id
            );
            if (tags.size) {
              await guildEntity.tags.init();
              guildEntity.tags.add(
                ...tags.map(
                  ({ name, content, createdBy }) =>
                    new TagEntity({ name, content, createdBy })
                )
              );
            }

            const warns = mappedDump.filter(
              (_, k) => k.startsWith('warn') && k.slice(-18) === id
            );
            if (warns.size) {
              await guildEntity.warns.init();
              guildEntity.warns.add(
                ...warns.map(
                  (warn, k) =>
                    new WarnEntity({
                      member: k.split(':')[1].slice(0, 18),
                      history: warn.map(
                        ({
                          warner,
                          reason
                        }: {
                          warner: string;
                          reason: string | null;
                        }) => ({
                          at: new Date(),
                          reason: reason ?? undefined,
                          warner
                        })
                      )
                    })
                )
              );
            }

            const mutes = mappedDump.filter(
              (v, k) => k.startsWith('mute') && v.guild === id
            );
            if (mutes.size) {
              await guildEntity.mutes.init();
              guildEntity.mutes.add(
                ...mutes
                  .filter(mute => !Number.isInteger(mute))
                  .map(
                    ({ endTime, member, muter, reason }) =>
                      new MuteEntity({
                        end: new Date(endTime),
                        reason: reason ?? undefined,
                        member,
                        muter
                      })
                  )
              );
            }
          }
          break;

        case 'dick':
          await this.db.findOrInsert(UserEntity, id, { dick: data });
          break;

        case 'gay':
          await this.db.findOrInsert(UserEntity, id, { gay: data });
          break;

        default:
          break;
      }
      await this.db
        .flush()
        .catch(err => this.logger.error(err, { origin: `Migrate(${key})` }));

      this.logger.info(`${++i} / ${mappedDump.size}`, {
        origin: `Migrate(${key})`
      });
    }

    status.edit(`Done ${this.emojis.cache.get(EMOJIS.TICK)}`);
  }
}
