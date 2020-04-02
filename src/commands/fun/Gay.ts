import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { Target } from '../../util/Targetter';
import HavocUser from '../../structures/extensions/HavocUser';
import Havoc from '../../client/Havoc';
import User from '../../structures/entities/User';
import Util from '../../util/Util';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: 'A 100% accurate gayness calculator.',
      args: { type: Target.USER }
    });
  }

  async run(
    this: Havoc,
    {
      message,
      user
    }: {
      message: HavocMessage;
      user: HavocUser | null;
    }
  ) {
    if (!user) user = message.author;
    const emoji = (percentage: number) => {
      if (percentage >= 75) return '<:gay:410129441755496448>';
      if (percentage >= 50) return '🏳️‍🌈';
      if (percentage >= 25) return '🌈';
      return percentage ? '<:kappapride:462323575375003658>' : '📏';
    };
    const res = await this.db
      .findOrInsert(User, user.id, { gay: Util.randomInt(0, 100) })
      .then(({ gay }) => gay);

    message.respond(
      `I can tell you for sure that, ${
        user.id === message.author.id ? 'you are' : `**${user.tag}** is`
      } **${res}% gay** ${emoji(res!)}.`
    );
  }
}
