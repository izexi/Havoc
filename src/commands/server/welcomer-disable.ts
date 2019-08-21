import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';

export default class WelcomerDisable extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b0011,
			description: 'Disable welcomer on the server.',
			userPerms: { flags: 'MANAGE_GUILD' }
		});
	}

	public async run(this: HavocClient, { msg }: { msg: HavocMessage }) {
		const { welcomer } = await msg.guild.config;
		if (!welcomer) {
			return msg.respond(`welcomer has not been enabled on this server.`);
		}
		await msg.guild.removeConfig('welcomer');
		msg.respond(`I have disabled welcomer for this server.`);
	}
}
