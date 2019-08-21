import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import { Webhook, WebhookClient } from 'discord.js';

export default class LogsDisable extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b0011,
			description: 'Disable logs on the server.',
			userPerms: { flags: 'MANAGE_GUILD' }
		});
	}

	public async run(this: HavocClient, { msg }: { msg: HavocMessage }) {
		const { logs } = await msg.guild.config;
		if (!logs) {
			return msg.respond(`logs has not been enabled on this server.`);
		}
		await msg.guild.removeConfig('logs');
		msg.respond(`I have disabled logs for this server.`);
		msg.guild.logsEnabled = false;
		const existing = await msg.guild.getWebhook();
		if (existing instanceof Webhook) await existing.delete(`Disabled by ${msg.author.tag}`);
		if (existing instanceof WebhookClient) {
			const webhooks = await msg.guild.fetchWebhooks();
			const webhook = webhooks.get(existing!.id);
			if (webhook) await webhook.delete(`Disabled by ${msg.author.tag}`);
		}
		this.db.category = 'webhook';
		await this.db.delete(msg.guild.id);
	}
}
