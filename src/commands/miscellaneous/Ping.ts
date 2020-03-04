import Command from '../../structures/bases/Command';
import Havoc from '../../client/Havoc';
import { Message } from 'discord.js';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: 'Pong!'
    });
  }

  async run(this: Havoc, { message }: { message: Message }) {
    message.reply('Pong!');
  }
}
