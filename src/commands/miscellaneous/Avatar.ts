import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { Target } from '../../util/Targetter';
import HavocUser from '../../structures/extensions/HavocUser';

export default class extends Command {
  constructor() {
    super(__filename, {
      dm: true,
      description: "View a user's avatar along with the URL.",
      aliases: ['a', 'av'],
      args: { type: Target.USER }
    });
  }

  async run({
    message,
    user
  }: {
    message: HavocMessage;
    user: HavocUser | null;
  }) {
    if (!user) user = message.author;
    const avatar = user.pfp;

    message.sendEmbed({
      setDescription: `[URL for ${
        user.id === message.author.id ? 'your' : `${user.tag}'s`
      } avatar](${avatar})`,
      setImage: avatar,
      setThumbnail: avatar
    });
  }
}
