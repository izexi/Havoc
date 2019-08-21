import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import HavocTextChannel from '../../extensions/TextChannel';

export default class AutoroleEnable extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b1000,
			description: 'Enable autorole for the inputted role.',
			args: [{
				type: 'channel',
				prompt: { initialMsg: 'enter the the channel you would like to set the welcomer to.' }
			}],
			userPerms: { flags: 'MANAGE_GUILD' }
		});
	}

	public async run(this: HavocClient, { msg, target: { channel } }: { msg: HavocMessage; target: { channel: HavocTextChannel } }) {
		const { welcomer } = await msg.guild.config;
		await msg.guild.addConfig({ welcomer: channel.id });
		msg.respond(`${channel && msg.guild.channels.has(welcomer) ? `I have updated the welcomer channel from ${msg.guild.roles.get(welcomer)} to ${channel}` : `I have enabled welcomer in ${channel} for this server.`}`);
	}
}
