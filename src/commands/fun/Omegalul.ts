import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { Target } from '../../util/targetter';
import { PROMPT_INITIAL, EMOJIS } from '../../util/CONSTANTS';

export default class extends Command {
  constructor() {
    super(__filename, {
      dm: true,
      description: `Replaces any \`o\`s with ${EMOJIS.OMEGALUL} in the inputted message.`,
      args: {
        type: Target.TEXT,
        required: true,
        prompt: PROMPT_INITIAL[Target.TEXT](EMOJIS.OMEGALUL)
      }
    });
  }

  async run({ message, text }: { message: HavocMessage; text: string }) {
    message.send(text.replace(/o/gi, EMOJIS.OMEGALUL), {
      split: { char: EMOJIS.OMEGALUL },
      disableMentions: 'everyone'
    });
  }
}
