import HavocClient from '../client/Havoc';
import HavocTextChannel from '../extensions/TextChannel';
import HavocMessage from '../extensions/Message';
import Schedule from '../structures/bases/Schedule';

export default class Poll extends Schedule {
	public channel: string;

	public message: string;

	public options: number;

	public constructor(client: HavocClient, endTime: number, { channel, message, options }: { channel: string; message: string; options: string }) {
		super(client, endTime);
		this.channel = channel;
		this.message = message;
		this.options = Number(options);
	}

	public async onError() {
		await this.delete();
		// @ts-ignore
		await this.rest.handlers.get(`/channels/${this.channel}/messages/:id`).run();
		return null;
	}

	public async delete() {
		await this._client.db.query(`DELETE FROM havoc where key = 'poll:${this.endTime}'`);
		this._client.scheduler.delete(this.endTime);
	}

	public async end() {
		(this._client.channels.get(this.channel)! as HavocTextChannel).messages.fetch(this.message)
			.then(async msg => (msg as HavocMessage).endPoll(this.options))
			.catch(() => null);
		await this.delete();
	}

	public async update() {
		await new Promise(resolve => setTimeout(resolve, 120));
		const timeLeft = this.endTime - Date.now();
		if (timeLeft <= 0 && this._client.scheduler.has(this.endTime)) return this.end();
	}
}
