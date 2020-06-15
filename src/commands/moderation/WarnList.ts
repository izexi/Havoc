import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { Target } from '../../util/targetter';
import Havoc from '../../client/Havoc';
import Util from '../../util';
import HavocUser from '../../structures/extensions/HavocUser';
import { PROMPT_INITIAL } from '../../util/CONSTANTS';

export default class extends Command {
  constructor() {
    super(__filename, {
      description:
        "View the your / inputted member's warning(s) in the server.",
      aliases: ['warnlog', 'wl'],
      args: {
        required: true,
        type: Target.USER,
        prompt: PROMPT_INITIAL[Target.USER](
          'se warnings you would like to view'
        ),
      },
      requiredPerms: 'MANAGE_GUILD',
    });
  }

  async run(
    this: Havoc,
    {
      message,
      user,
    }: {
      message: HavocMessage;
      user: HavocUser;
    }
  ) {
    const guild = await this.db.guildRepo.findOne(
      { id: message.guild!.id, warns: { member: user.id } },
      { populate: ['warns'] }
    );
    const warns = guild?.warns
      .getItems()
      .find(({ member }) => member === user.id);
    if (!warns)
      return message.respond(
        `\`${user.tag}\` doesn't have any warnings in this server.`
      );

    message.paginate({
      title: `${user.tag}'s warns`,
      descriptions: await Promise.all(
        warns.history.map(async ({ at, warner, reason }, i) =>
          Util.stripBlankLines(`**Warn:** ${i + 1}
            **Warned By:** ${(await this.users.fetch(warner)).tag}
            **Warned At:** ${at.toLocaleString()}
            ${reason ? `**Reason:** ${reason}` : ''}`)
        )
      ),
      thumbnails: Array(warns.history.length).fill(user.pfp),
      maxPerPage: 1,
      page: Number(message.arg),
    });
  }
}
