import Command from '../../structures/bases/Command';
import Havoc from '../../client/Havoc';
import HavocMessage from '../../structures/extensions/HavocMessage';

export default class extends Command {
  constructor() {
    super(__filename, {
      dm: true,
      description: 'Supports me.'
    });
  }

  async run(this: Havoc, { message }: { message: HavocMessage }) {
    message.respond({
      setDescription: `Donate to me by clicking on [Patreon](https://www.patreon.com/user?u=15028160 or [PayPal](https://paypal.me/havoceditor) (join [this server](https://discord.gg/3Fewsxq) to receive the Donator role)
				              All donations will be used towards hosting costs for the bot. Donations are NOT required or expected, but are much appreciated`
    });
  }
}
