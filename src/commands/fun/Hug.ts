import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import Util from '../../util';
import Havoc from '../../client/Havoc';
import { EMOJIS } from '../../util/CONSTANTS';

export default class extends Command {
  constructor() {
    super(__filename, {
      dm: true,
      description: EMOJIS.NO_HUG,
    });
  }

  async run(this: Havoc, { message }: { message: HavocMessage }) {
    message
      .respond(
        this.emojis.cache.get(Util.randomArrEl(EMOJIS.HUG))!.toString(),
        {
          author: false,
          contentOnly: true,
        }
      )
      .then((msg) => this.setTimeout(() => msg.edit(EMOJIS.NO_HUG), 2000));
  }
}
