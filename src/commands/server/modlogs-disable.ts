import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';

export default class ModlogsDisable extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b0011,
			description: 'Disable mod logs on the server.',
			userPerms: { flags: 'MANAGE_GUILD' }
		});
	}

	public async run(this: HavocClient, { msg }: { msg: HavocMessage }) {
		const { modlogs } = await msg.guild.config;
		if (!modlogs) {
			return msg.respond(`mod logs has not been enabled on this server.`);
		}
		await msg.guild.removeConfig('modlogs');
		msg.respond(`I have disabled mod logs for this server.`);
	}
}
