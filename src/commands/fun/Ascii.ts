import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { Target } from '../../util/targetter';
import HavocUser from '../../structures/extensions/HavocUser';
import util from '../../util';
import { EMOJIS } from '../../util/CONSTANTS';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const imageToAscii = require('image-to-ascii');

export default class extends Command {
  constructor() {
    super(__filename, {
      dm: true,
      description: "View your / a user's avatar as ASCII art.",
      args: { type: Target.USER },
    });
  }

  async run({
    message,
    user,
  }: {
    message: HavocMessage;
    user: HavocUser | null;
  }) {
    if (!user) user = message.author;
    const avatar = user.pfp;
    const loading = await message.respond(`Generating... ${EMOJIS.LOADING}`);

    imageToAscii(
      avatar,
      { size: { height: 30, width: 30 } },
      (err: Error, converted: string) => {
        if (err)
          return loading.edit(
            loading.embeds[0].setDescription(
              `**${message.author.tag}** There was an error while attempting this.`
            )
          );

        loading.edit(
          message.constructEmbed({ setDescription: util.codeblock(converted) })
        );
      }
    );
  }
}
