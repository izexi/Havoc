import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { EMOJIS } from '../../util/CONSTANTS';

export default class extends Command {
  constructor() {
    super(__filename, {
      dm: true,
      description: EMOJIS.WIDEPEEPOHAPPY,
      aliases: [EMOJIS.WIDEPEEPOHAPPY]
    });
  }

  async run({ message }: { message: HavocMessage }) {
    message.respond(EMOJIS.WIDEPEEPOHAPPY, {
      author: false,
      contentOnly: true
    });
  }
}
