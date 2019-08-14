import { Guild, Webhook, WebhookClient, MessageEmbed, GuildMember } from 'discord.js';
import HavocClient from '../client/Havoc';
import Logger from '../util/Logger';
import HavocTextChannel from './TextChannel';
import HavocMessage from './Message';
import HavocUser from './User';
import Util from '../util/Util';

export default class HavocGuild extends Guild {
	public client!: HavocClient;

	public prefix!: string;

	public logsEnabled = false;

	public tags: Map<string, string> = new Map();

	private _config: any = null;

	private _webhook!: Webhook | WebhookClient;

	public iconURL() {
		return super.iconURL() ||
			`https://placeholdit.imgix.net/~text?txtsize=50&txtfont=Whitney&w=128&h=128&bg=2f3136&txtclr=fff&txt=${this.name.split(' ').map((name: string) => name[0]).join('')}`;
	}

	public get config() {
		const cached = this._config;
		if (cached) return Promise.resolve(cached);
		this.client.db.category = 'config';
		return this.client.db.get(this.id)
			.then(async res => this._config = res || {})
			.catch(() => ({}));
	}

	public async addConfig(obj: object) {
		this.client.db.category = 'config';
		const updated = { ...(await this.config), ...obj };
		this.client.db.set(this.id, updated)
			.then(async () => this._config = updated)
			.catch(error => Logger.error('Database error while updating guild config', error));
	}

	public async removeConfig(key: string) {
		this.client.db.category = 'config';
		const updated = await this.config;
		delete updated[key];
		this.client.db.set(this.id, updated)
			.then(async () => this._config = updated)
			.catch(error => Logger.error('Database error while updating guild config', error));
	}

	public async getWebhook() {
		if (this._webhook) return this._webhook;
		this.client.db.category = 'webhook';
		let webhook = await this.client.db.get(this.id);
		if (!webhook) {
			const { logs } = await this.config;
			if (!logs) return null;
			const channel = this.client.channels.get(logs) as HavocTextChannel;
			if (!channel) {
				await this.removeConfig('logs');
				return null;
			}
			webhook = await channel.createWebhook('HavocLogs', { avatar: this.client.user!.displayAvatarURL() }).catch(() => null);
			if (!webhook) return null;
			this.webhook = webhook;
			this.client.db.category = 'webhook';
			await this.client.db.set(this.id, {
				id: webhook.id,
				token: webhook.token
			});
			return webhook;
		}
		return new WebhookClient(webhook.id, webhook.token);
	}

	public async modlog(msg: HavocMessage, target: GuildMember | HavocUser, reason?: string | null, duration?: number) {
		if (!(target instanceof HavocUser)) target = await this.client.users.fetch(target.id) as HavocUser;
		const { modlogs } = await this.config;
		if (!modlogs) return;
		const channel = this.client.channels.get(modlogs) as HavocTextChannel;
		if (!channel) return this.removeConfig('modlogs');
		const colour: { [key: string]: string } = {
			warn: '#ffff00',
			clearwarnings: '#fefefe',
			mute: 'GOLD',
			kick: 'ORANGE',
			softban: 'DARK_ORANGE',
			ban: 'RED',
			unban: 'GREEN'
		};
		channel.send(
			new MessageEmbed()
				.setAuthor(msg.author.tag, msg.author.displayAvatarURL())
				.setDescription(`
					**Member:** ${target.tag}
					**Action:** ${Util.captialise(msg.command.name.replace('clearwarnings', 'Clear Warnings'))}
					${duration ? `**Duration:** ${duration}` : ''}
					${reason ? `**Reason:** ${reason}` : ''}
				`)
				.setColor(colour[msg.command.name])
				.setTimestamp()
		);
	}

	public set webhook(webhook: Webhook | WebhookClient) {
		this._webhook = webhook;
	}
}
