import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import HavocTextChannel from '../../extensions/TextChannel';

export default class LogsEnable extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b1000,
			description: 'Enable logs for the inputted channel.',
			args: [{
				type: 'channel',
				prompt: { initialMsg: 'enter the channel you would like to set the logs to.' }
			}],
			userPerms: { flags: ['MANAGE_GUILD', 'MANAGE_WEBHOOKS'] }
		});
	}

	public async run(this: HavocClient, { msg, target: { channel } }: { msg: HavocMessage; target: { channel: HavocTextChannel } }) {
		const { logs } = await msg.guild.config;
		await msg.guild.addConfig({ logs: channel.id });
		msg.guild.logsEnabled = true;
		msg.sendEmbed({ setDescription: `**${msg.author.tag}** ${channel && msg.guild.channels.has(logs) ? `I have updated the logs channel from ${msg.guild.channels.get(logs)} to ${channel}` : `I have enabled logs in ${channel} for this server.`}` });
		const existing = await msg.guild.getWebhook();
		if (!existing) {
			const webhook = await channel.createWebhook('HavocLogs', { avatar: this.user!.displayAvatarURL() });
			msg.guild.webhook = webhook;
			this.db.category = 'webhook';
			await this.db.set(msg.guild.id, {
				id: webhook.id,
				token: webhook.token
			});
		}
	}
}
