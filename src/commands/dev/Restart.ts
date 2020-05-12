import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import Havoc from '../../client/Havoc';
import DevEntity from '../../structures/entities/DevEntity';
import { EMOJIS } from '../../util/CONSTANTS';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: 'Restart me.',
      dm: true
    });
  }

  async run(this: Havoc, { message }: { message: HavocMessage }) {
    const restart = await message
      .respond(`${EMOJIS.LOADING} Restarting..`, {
        author: false
      })
      .then(msg => ({ channel: msg.channel.id, message: msg.id }));

    await this.db.upsert(DevEntity, message.author.id, { restart });
    process.exit(1);
  }
}
