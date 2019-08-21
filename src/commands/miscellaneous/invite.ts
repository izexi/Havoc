import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';

export default class Invite extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b0011,
			description: 'View an invite link to invite me to a server.',
			aliases: new Set(['inv'])
		});
	}

	public async run(this: HavocClient, { msg }: { msg: HavocMessage }) {
		msg.respond(`[Click here to invite **${this.user!.username}** to your server.](https://discordapp.com/oauth2/authorize?client_id=${this.user!.id}&scope=bot&permissions=2146958591)`);
	}
}
