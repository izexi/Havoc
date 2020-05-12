import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { EMOJIS } from '../../util/CONSTANTS';

export default class extends Command {
  constructor() {
    super(__filename, {
      dm: true,
      description: EMOJIS.SHRUG,
      aliases: [EMOJIS.SHRUG],
    });
  }

  async run({ message }: { message: HavocMessage }) {
    message.respond(EMOJIS.SHRUG, {
      author: false,
      contentOnly: true,
    });
  }
}
