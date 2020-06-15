import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import Havoc from '../../client/Havoc';
import Util from '../../util';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: "View a list of members' warning(s) in the guild.",
      requiredPerms: 'MANAGE_GUILD',
    });
  }

  async run(this: Havoc, { message }: { message: HavocMessage }) {
    const guild = await this.db.guildRepo.findOne(
      { id: message.guild!.id },
      { populate: ['warns'] }
    );
    const warns = guild?.warns.getItems();
    if (!warns?.length)
      return message.respond('No members have any warnings in this server.');

    message.paginate({
      title: `Warned members in \`${message.guild!.name}\``,
      descriptions: await Promise.all(
        warns
          .sort((prev, curr) => curr.history.length - prev.history.length)
          .map(async ({ member, history }) =>
            Util.stripBlankLines(`**Member:** ${
              (await this.users.fetch(member)).tag
            } (${member})
            **Warns:** ${history.length}\n`)
          )
      ),
      maxPerPage: 5,
      page: Number(message.arg),
    });
  }
}
