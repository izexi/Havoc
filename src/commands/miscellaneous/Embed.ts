import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { Target } from '../../util/Targetter';
import { PROMPT_INITIAL } from '../../util/Constants';

export default class extends Command {
  constructor() {
    super(__filename, {
      dm: true,
      description: 'Embeds the inputted text.',
      args: {
        type: Target.TEXT,
        required: true,
        prompt: PROMPT_INITIAL[Target.TEXT]('embed')
      }
    });
  }

  async run({ message, text }: { message: HavocMessage; text: string }) {
    message.respond({ setDescription: text });
  }
}
