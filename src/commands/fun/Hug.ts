import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import Util from '../../util/Util';
import Havoc from '../../client/Havoc';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: '🙅'
    });
  }

  async run(this: Havoc, { message }: { message: HavocMessage }) {
    const emojis = [
      '695300729736265770',
      '695300793779093525',
      '695300820123648011',
      '695300861903110164',
      '695300958271438931',
      '695301008326131804'
    ];
    message
      .respond(
        this.emojis.cache
          .get(emojis[Util.randomInt(0, emojis.length - 1)])!
          .toString(),
        false,
        true
      )
      .then(msg => this.setTimeout(() => msg.edit('🙅'), 2000));
  }
}
