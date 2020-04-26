import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { Target } from '../../util/Targetter';
import { PROMPT_INITIAL } from '../../util/Constants';

export default class extends Command {
  constructor() {
    super(__filename, {
      dm: true,
      description:
        'Replaces any `o`s with <:OMEGALUL:695303479790665758> in the inputted message.',
      args: {
        type: Target.TEXT,
        required: true,
        prompt: PROMPT_INITIAL[Target.TEXT]('<:OMEGALUL:695303479790665758>')
      }
    });
  }

  async run({ message, text }: { message: HavocMessage; text: string }) {
    message.send(text.replace(/o/gi, '<:OMEGALUL:695303479790665758>'), {
      split: { char: '👏' },
      disableMentions: 'everyone'
    });
  }
}
