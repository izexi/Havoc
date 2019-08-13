import { Guild, Webhook, WebhookClient } from 'discord.js';
import HavocClient from '../client/Havoc';
import Logger from '../util/Logger';
import HavocTextChannel from './TextChannel';

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

	public set webhook(webhook: Webhook | WebhookClient) {
		this._webhook = webhook;
	}
}
