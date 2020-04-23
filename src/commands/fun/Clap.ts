import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { Target } from '../../util/Targetter';

export default class extends Command {
  constructor() {
    super(__filename, {
      dm: true,
      description: 'Displays👏text👏like👏this👏',
      args: {
        type: Target.TEXT,
        required: true,
        prompt: 'enter👏the👏text👏that👏you👏would👏like👏to👏embed.'
      }
    });
  }

  async run({ message, text }: { message: HavocMessage; text: string }) {
    message.send(text.replace(/ /g, '👏'), {
      split: { char: '👏' },
      disableMentions: 'everyone'
    });
  }
}
