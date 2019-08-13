import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';

export default class AutoroleDisable extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b0011,
			description: 'Disable autorole on the server.',
			userPerms: { flags: 'MANAGE_GUILD' }
		});
	}

	public async run(this: HavocClient, { msg }: { msg: HavocMessage }) {
		const { autorole } = await msg.guild.config;
		if (!autorole) {
			return msg.sendEmbed({ setDescription: `**${msg.author.tag}** autorole has not been enabled on this server.` });
		}
		await msg.guild.removeConfig('autorole');
		msg.sendEmbed({ setDescription: `**${msg.author.tag}** I have disabled autorole for this server.` });
	}
}
