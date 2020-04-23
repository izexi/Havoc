import Command from '../../structures/bases/Command';
import Havoc from '../../client/Havoc';
import HavocMessage from '../../structures/extensions/HavocMessage';

export default class extends Command {
  constructor() {
    super(__filename, {
      dm: true,
      description: 'View an invite link to invite me to a server.',
      aliases: ['inv']
    });
  }

  async run(this: Havoc, { message }: { message: HavocMessage }) {
    message.respond(
      `[Click here to invite **${
        this.user!.username
      }** to your server.](https://discordapp.com/oauth2/authorize?client_id=${
        this.user!.id
      }&scope=bot&permissions=2146958591)`
    );
  }
}
