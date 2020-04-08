import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import Havoc from '../../client/Havoc';
import ms = require('ms');
import Util from '../../util/Util';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: 'View the currently muted users who are in the server.',
      aliases: ['mutes'],
      requiredPerms: 'MANAGE_GUILD'
    });
  }

  async run(
    this: Havoc,
    {
      message
    }: {
      message: HavocMessage;
    }
  ) {
    const muted = await this.db.guildRepo
      .findOne({ mutes: { guild: message.guild!.id } }, { populate: ['mutes'] })
      .then(guild =>
        guild?.mutes.getItems().sort((prev, curr) => {
          if (!prev.end) return 1;
          if (!curr.end) return -1;
          return prev.end.getTime() - curr.end.getTime();
        })
      );
    if (!muted?.length)
      return message.respond(
        'there are no members that are currently muted in this server'
      );

    message.paginate({
      title: `Currently muted members in \`${message.guild!.name}\``,
      descriptions: await Promise.all(
        muted.map(async ({ member, start, end, muter, reason }) =>
          Util.stripBlankLines(`**Muted User:** ${
            (await this.users.fetch(member)).tag
          }
          ${
            end
              ? `**Time Left:**  ${ms(end.getTime() - Date.now(), {
                  long: true
                })}`
              : ''
          }
          **Mute Length:**  ${
            end
              ? ms(end.getTime() - start.getTime(), { long: true })
              : '∞ minutes'
          }
          **Muted By:** ${(await this.users.fetch(muter)).tag}
          ${reason ? `**Reason:**  ${reason}` : ''}`)
        )
      ),
      maxPerPage: 1,
      thumbnails: await Promise.all(
        muted.map(({ member }) =>
          this.users.fetch(member).then(user => user.displayAvatarURL())
        )
      ),
      page: Number(message.arg)
    });
  }
}
