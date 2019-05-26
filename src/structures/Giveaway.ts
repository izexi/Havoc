import { MessageEmbed } from 'discord.js';
import HavocClient from '../client/Havoc';
import HavocTextChannel from '../extensions/TextChannel';
import HavocMessage from '../extensions/Message';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ms = require('ms');

export default class Giveaway {
	private _client: HavocClient;

	public endTime: number;

	public channel: string;

	public message: string;

	public winners: number;

	public constructor(client: HavocClient, endTime: number, { channel, message, winners }: { channel: string; message: string; winners: string }) {
		this._client = client;
		this.endTime = endTime;
		this.channel = channel;
		this.message = message;
		this.winners = Number(winners);
	}

	public async end() {
		(this._client.channels.get(this.channel)! as HavocTextChannel).messages.fetch(this.message)
			.then(async msg => {
				(msg as HavocMessage).endGiveaway(this.winners);
			})
			.catch(() => null);
		await this._client.db.query(`DELETE FROM havoc where key = 'giveaway:${this.endTime}'`);
	}

	public async update() {
		await new Promise(resolve => setTimeout(resolve, 120));
		const endTime = this.endTime - Date.now();
		if (endTime <= 0 && this._client.giveaways.has(this.endTime)) return this._client.giveaways.remove(this.endTime);
		// TODO: a nicer implementation for this
		if ((endTime <= 3000 && (endTime % 1000 <= 1000)) || (endTime <= 180000 && (endTime % 60000 <= 1000)) || Math.abs(endTime - 3600000) <= 1000 || endTime >= 86400000) {
			return (this._client.channels.get(this.channel)! as HavocTextChannel).messages.fetch(this.message).then(async msg => {
				if (msg.embeds[0].footer!.text!.includes('ended')) return this._client.giveaways.remove(this.endTime);
				if (endTime >= 86400000 && msg.embeds[0].description.match(/\nTime remaining: (.+)$/)![1] === `**${ms(endTime, { 'long': true })}**`) return;
				const embed = new MessageEmbed(msg.embeds[0])
					.setColor(endTime <= 3000 ? 'RED' : 'ORANGE')
					.setDescription(msg.embeds[0].description.replace(/\nTime remaining: (.+)$/, `\nTime remaining: **${ms(Math.max(endTime, 1000), { 'long': true })}**`));
				return msg.edit(msg.content, embed);
			}).catch(async () => this._client.db.query(`DELETE FROM havoc where key = 'giveaway:${this.endTime}'`));
		}
	}
}
