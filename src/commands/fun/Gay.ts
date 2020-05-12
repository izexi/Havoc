import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { Target } from '../../util/targetter';
import HavocUser from '../../structures/extensions/HavocUser';
import Havoc from '../../client/Havoc';
import UserEntity from '../../structures/entities/UserEntity';
import Util from '../../util';
import { EMOJIS } from '../../util/CONSTANTS';

export default class extends Command {
  constructor() {
    super(__filename, {
      dm: true,
      description: 'A 100% accurate gayness calculator.',
      args: { type: Target.USER },
    });
  }

  async run(
    this: Havoc,
    {
      message,
      user,
    }: {
      message: HavocMessage;
      user: HavocUser | null;
    }
  ) {
    if (!user) user = message.author;

    const res = await this.db
      .findOrInsert(UserEntity, user.id, { gay: Util.randomInt(0, 100) })
      .then(({ gay }) => gay);

    message.respond(
      `I can tell you for sure that, ${
        user.id === message.author.id ? 'you are' : `**${user.tag}** is`
      } **${res}% gay** ${EMOJIS.GAY(res!)}.`
    );
  }
}
