import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import HavocTextChannel from '../../extensions/TextChannel';

export default class AutoroleEnable extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b1000,
			description: 'Enable mod logs for the inputted channel.',
			args: [{
				type: 'channel',
				prompt: { initialMsg: 'enter the channel you would like to set the mod logs to.' }
			}],
			userPerms: { flags: 'MANAGE_GUILD' }
		});
	}

	public async run(this: HavocClient, { msg, target: { channel } }: { msg: HavocMessage; target: { channel: HavocTextChannel } }) {
		const { modlogs } = await msg.guild.config;
		await msg.guild.addConfig({ modlogs: channel.id });
		msg.respond(`${channel && msg.guild.channels.has(modlogs) ? `I have updated the mod logs channel from ${msg.guild.channels.get(modlogs)} to ${channel}` : `I have enabled mod logs in ${channel} for this server.`}`);
	}
}
