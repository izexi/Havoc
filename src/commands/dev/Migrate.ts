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
import { PROMPT_ENTER } from '../../util/CONSTANTS';

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
    const status = await message.channel.send(
      'Migrating... <a:loading:424975362229927959>'
    );
    const dump = await fetch(text).then(r => r.text());
    const mappedDump: Collection<string, any> = dump
      .split('\n')
      .filter(d => /^(config|dick|gay)/.test(d))
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
              const disabled = mappedDump.get(`disabledLogs:${id}`);
              const webhook = mappedDump.get(`webhook:${id}`);
              if (disabled) logs.disabled = disabled;
              if (webhook) {
                opts.logs = { ...logs, webhook };
              }
            }

            await this.db.upsert(GuildEntity, id, opts);

            const tags = mappedDump.filter(
              (v, k) => k.startsWith('tags') && v.guild === id
            );
            if (tags.size) {
              const guild = await this.db.findOrInsert(GuildEntity, id);
              await guild.tags.init();
              guild.tags.add(
                ...tags.map(
                  ({ name, content, createdBy }) =>
                    new TagEntity({ name, content, createdBy })
                )
              );
            }

            const warns = mappedDump.filter(
              (v, k) => k.startsWith('warn') && v.guild === id.slice(-18)
            );
            if (warns.size) {
              const guild = await this.db.findOrInsert(GuildEntity, id);
              await guild.warns.init();
              guild.warns.add(
                ...warns.map(
                  warn =>
                    new WarnEntity({
                      id: id.slice(0, 18),
                      history: warn.map(
                        ({
                          warner,
                          reason
                        }: {
                          warner: string;
                          reason: string;
                        }) => ({
                          at: new Date(),
                          warner,
                          reason
                        })
                      )
                    })
                )
              );
            }

            const mutes = mappedDump.filter(
              (v, k) => k.startsWith('mute') && v.guild === id
            );
            if (tags.size) {
              const guild = await this.db.findOrInsert(GuildEntity, id);
              await guild.mutes.init();
              guild.mutes.add(
                ...mutes
                  .filter(mute => !Number.isInteger(mute))
                  .map(
                    ({ endTime, member, muter, reason }) =>
                      new MuteEntity({
                        end: new Date(endTime),
                        member,
                        muter,
                        reason
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

    status.edit('Done <:tick:416985886509498369>');
  }
}
