import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { Target } from '../../util/targetter';
import { PROMPT_INITIAL } from '../../util/CONSTANTS';

export default class extends Command {
  constructor() {
    super(__filename, {
      dm: true,
      description: 'DiSpLaYs tExT LiKe tHiS',
      args: {
        type: Target.TEXT,
        required: true,
        prompt: PROMPT_INITIAL[Target.TEXT]('mock'),
      },
    });
  }

  async run({ message, text }: { message: HavocMessage; text: string }) {
    message.channel.send(
      text.replace(/./g, (letter, i) =>
        i % 2 ? letter : letter.toUpperCase()
      ),
      { disableMentions: 'everyone' }
    );
  }
}
