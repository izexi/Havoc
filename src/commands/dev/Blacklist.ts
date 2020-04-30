import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import Havoc from '../../client/Havoc';
import DevEntity, { Blacklistable } from '../../structures/entities/DevEntity';
import { PROMPT_ENTER, NOOP } from '../../util/CONSTANTS';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: '(Black/White)list a(ll) command(s) / user / guild.',
      aliases: ['whitelist'],
      args: {
        name: 'type',
        type: ['command', 'user', 'guild'],
        prompt: PROMPT_ENTER('what you would like to blacklist')
      },
      dm: true
    });
  }

  async run(
    this: Havoc,
    {
      message,
      option
    }: {
      message: HavocMessage;
      option: 'command' | 'user' | 'guild';
    }
  ) {
    let blacklisted = null;
    const toBlackList = message.arg!.toLowerCase();
    let deleted = Object.values(this.blacklisted).some(set =>
      set.delete(toBlackList)
    );

    if (!deleted) {
      switch (option) {
        case 'command': {
          const command = this.commandHandler.find(toBlackList);
          if (toBlackList === 'all') {
            blacklisted = 'all commands';
            if (this.blacklisted.commands.size) {
              this.blacklisted.commands = new Set();
              deleted = true;
            } else {
              [...this.commandHandler.holds.values()]
                .filter(command => command.category !== 'dev')
                .forEach(command =>
                  this.blacklisted.commands.add(command.name)
                );
            }
          } else if (command) {
            this.blacklisted.commands.add(command.name);
            blacklisted = command.name;
          }
          break;
        }
        case 'user':
          await this.users
            .fetch(toBlackList)
            .then(user => {
              this.blacklisted.users.add(user.id);
              blacklisted = user.tag;
            })
            .catch(NOOP);
          break;
        case 'guild':
          {
            const guild = this.guilds.cache.get(toBlackList);
            this.blacklisted.guilds.add(toBlackList);
            blacklisted = guild?.name ?? toBlackList;
            if (guild) guild.leave();
          }
          break;
        default:
          break;
      }
    }

    if (!blacklisted && !deleted) return message.respond('invalid option');

    await this.db.upsert(DevEntity, message.author.id, {
      blacklisted: Object.fromEntries(
        Object.entries(this.blacklisted).map(([k, v]) => [k, [...v]])
      ) as { [key in Blacklistable]: string[] }
    });
    message.respond(
      `${blacklisted} ha${toBlackList === 'all' ? 've' : 's'} been ${
        deleted ? 'white' : 'black'
      }listed`
    );
  }
}
