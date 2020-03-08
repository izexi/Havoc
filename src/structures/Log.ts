import { MessageEmbed, GuildAuditLogsActions, Guild, Invite, GuildAuditLogsEntry } from 'discord.js';
import HavocGuild from '../extensions/Guild';

export default {
	ignore(guild: HavocGuild | Guild) {
		return !(guild as HavocGuild).logsEnabled || !guild.me!.hasPermission('VIEW_AUDIT_LOG') || !guild.me!.hasPermission('EMBED_LINKS') || !guild.me!.hasPermission('MANAGE_WEBHOOKS');
	},
	async send(guild: HavocGuild, embed: MessageEmbed) {
		if (this.ignore(guild)) return;
		const webhook = await guild.getWebhook();
		if (!webhook) return;
		webhook.send({
			embeds: [embed],
			username: ',HavocLogs',
			avatarURL: Math.round(Math.random()) ? 'https://cdn.discordapp.com/emojis/444944971653709825.png?v=1' : 'https://i.imgur.com/l3H2S2d.png'
		}).catch(() => null);
	},
	async getEntry(guild: Guild, type: keyof GuildAuditLogsActions) {
		if (this.ignore(guild)) return;
		return guild.fetchAuditLogs({ type: type as any, limit: 1 })
			.then((audit: any) => audit.entries.first())
			.catch(() => null);
	},
	async getExecutor({ guild, id }: { guild: Guild | null; id: string | null }, type: keyof GuildAuditLogsActions, entry?: GuildAuditLogsEntry | null) {
		if (!guild || this.ignore(guild)) return;
		if (typeof entry === 'undefined') entry = await this.getEntry(guild, type);
		if (!entry || !entry.target || Math.abs(Date.now() - entry.createdTimestamp) > 5000 || (!(entry.target instanceof Invite) && entry.target.id !== id)) return null;
		return entry.executor.tag;
	}
};
