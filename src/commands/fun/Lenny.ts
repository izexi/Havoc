import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';

export default class extends Command {
  constructor() {
    super(__filename, {
      dm: true,
      description: '( ͡° ͜ʖ ͡°)',
      aliases: ['( ͡° ͜ʖ ͡°)']
    });
  }

  async run({ message }: { message: HavocMessage }) {
    message.respond('( ͡° ͜ʖ ͡°)', false, true);
  }
}
