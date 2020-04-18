import Command from '../../structures/bases/Command';
import Havoc from '../../client/Havoc';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { tagFields } from './Tags-info';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: 'View all the tags in the server.'
    });
  }

  async run(this: Havoc, { message }: { message: HavocMessage }) {
    if (!message.guild!.tags.size)
      return message.respond(`there are no tags in this server.`);

    const guild = await this.db.guildRepo.findOne(
      { id: message.guild!.id },
      { populate: ['tags'] }
    );
    if (!guild) return;

    await guild.tags.init();
    message.paginate({
      title: `Tags in \`${message.guild!.name}\``,
      descriptions: await Promise.all(
        guild.tags
          .getItems()
          .sort(
            (prev, curr) => curr.createdAt.getTime() - prev.createdAt.getTime()
          )
          .map(tag =>
            tagFields(tag, this).then(fields =>
              fields
                .map(
                  ({ name, value }) =>
                    `**${name}**:
                    ${value}
                    `
                )
                .join('\n')
            )
          )
      ),
      thumbnails: await Promise.all(
        guild.tags
          .getItems()
          .map(({ createdBy }) =>
            this.users.fetch(createdBy).then(user => user.displayAvatarURL())
          )
      ),
      maxPerPage: 1,
      page: Number(message.arg)
    });
  }
}
