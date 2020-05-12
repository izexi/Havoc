import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { Target } from '../../util/targetter';
import { EMOJIS } from '../../util/CONSTANTS';

const clapify = (str: string) => str.replace(/ /g, EMOJIS.CLAP);

export default class extends Command {
  constructor() {
    super(__filename, {
      dm: true,
      description: clapify('Displays text like this'),
      args: {
        type: Target.TEXT,
        required: true,
        prompt: clapify('enter the text that you would like to embed.'),
      },
    });
  }

  async run({ message, text }: { message: HavocMessage; text: string }) {
    message.send(clapify(text), {
      split: { char: ' ' },
      disableMentions: 'everyone',
    });
  }
}
