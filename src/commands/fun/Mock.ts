import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { Target } from '../../util/Targetter';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: 'DiSpLaYs tExT LiKe tHiS',
      args: {
        type: Target.TEXT,
        required: true,
        prompt: 'enter the text that you would like to mock.'
      }
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
