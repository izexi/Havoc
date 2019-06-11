import { MessageEmbed } from 'discord.js';
import HavocClient from '../client/Havoc';
import HavocTextChannel from '../extensions/TextChannel';
import HavocMessage from '../extensions/Message';
import Schedule from '../structures/bases/Schedule';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ms = require('ms');

export default class Giveaway extends Schedule {
	public channel: string;

	public message: string;

	public winners: number;

	public constructor(client: HavocClient, endTime: number, { channel, message, winners }: { channel: string; message: string; winners: string }) {
		super(client, endTime);
		this.channel = channel;
		this.message = message;
		this.winners = Number(winners);
	}

	public async onError() {
		await this.delete();
		// @ts-ignore
		await this.rest.handlers.get(`/channels/${this.channel}/messages/:id`).run();
		return null;
	}

	public async delete() {
		await this._client.db.query(`DELETE FROM havoc where key = 'giveaway:${this.endTime}'`);
		this._client.scheduler.delete(this.endTime);
	}

	public async end() {
		(this._client.channels.get(this.channel)! as HavocTextChannel).messages.fetch(this.message)
			.then(async msg => (msg as HavocMessage).endGiveaway(this.winners))
			.catch(() => null);
		await this.delete();
	}

	public async update() {
		await new Promise(resolve => setTimeout(resolve, 120));
		const timeLeft = this.endTime - Date.now();
		if (timeLeft <= 0 && this._client.scheduler.has(this.endTime)) return this.end();
		// TODO: a nicer implementation for this
		if ((timeLeft <= 3000 && (timeLeft % 1000 <= 1000)) || (timeLeft <= 180000 && (timeLeft % 60000 <= 1000)) || Math.abs(timeLeft - 3600000) <= 1000 || timeLeft >= 86400000) {
			return (this._client.channels.get(this.channel)! as HavocTextChannel).messages.fetch(this.message).then(async msg => {
				if (msg.embeds[0].footer!.text!.includes('ended')) return this.delete();
				if (timeLeft >= 86400000 && msg.embeds[0].description.match(/\nTime remaining: (.+)$/)![1] === `**${ms(timeLeft, { 'long': true })}**`) return;
				const embed = new MessageEmbed(msg.embeds[0])
					.setColor(timeLeft <= 3000 ? 'RED' : 'ORANGE')
					.setDescription(msg.embeds[0].description.replace(/\nTime remaining: (.+)$/, `\nTime remaining: **${ms(Math.max(timeLeft, 1000), { 'long': true })}**`));
				return msg.edit(msg.content, embed);
			});
		}
	}
}
