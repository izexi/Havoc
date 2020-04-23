import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { Target } from '../../util/Targetter';

export default class extends Command {
  constructor() {
    super(__filename, {
      dm: true,
      description:
        'Replaces any `o`s with <:OMEGALUL:695303479790665758> in the inputted message.',
      args: {
        type: Target.TEXT,
        required: true,
        prompt:
          'enter the text that you would like to <:OMEGALUL:695303479790665758>.'
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
