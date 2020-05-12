import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { Target } from '../../util/targetter';
import HavocUser from '../../structures/extensions/HavocUser';
import Havoc from '../../client/Havoc';
import UserEntity from '../../structures/entities/UserEntity';
import Util from '../../util';

export default class extends Command {
  constructor() {
    super(__filename, {
      dm: true,
      description: 'A 100% accurate dick size calculator.',
      aliases: ['d', 'penis'],
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
    const rand = Math.random();
    let size = Util.randomInt(21, 25);
    if (rand < 0.65) size = Util.randomInt(1, 5);
    else if (rand < 0.85) size = Util.randomInt(6, 15);
    else if (rand < 0.95) size = Util.randomInt(16, 20);

    const res = await this.db
      .findOrInsert(UserEntity, user.id, { dick: size })
      .then(({ dick }) => dick);

    message.respond({
      setDescription: `**${message.author.tag}** ${
        user.id === message.author.id
          ? 'after taking a measurement I can confirm that: You sir, have'
          : `according to my calculations, **${user.tag}** has`
      } a **${res} incher**.`,
      setFooter: `8${'='.repeat(res! * 2)}D`,
    });
  }
}
