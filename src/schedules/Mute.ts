import HavocClient from '../client/Havoc';
import Schedule from '../structures/bases/Schedule';

export default class MuteSchedule extends Schedule {
	public guild: string;

	public member: string;

	public reason: string;

	public length: number;

	public muter: string;

	public constructor(client: HavocClient, endTime: number, { guild, member, reason = '', length = 0, muter }: { guild: string; member: string; reason: string; length: number; muter: string }) {
		super(client, endTime);
		this.guild = guild;
		this.member = member;
		this.length = length;
		this.muter = muter;
		this.reason = reason;
	}

	public async onError() {
		return null;
	}

	public async delete() {
		await this._client.db.query(`DELETE FROM havoc where key = 'mute:${this.endTime}'`);
		this._client.scheduler.delete(this.endTime);
	}

	public async end() {
		const guild = this._client.guilds.get(this.guild);
		if (!guild) return;
		const member = await guild.members.fetch(this.member).catch(() => null);
		if (!member) return;
		// @ts-ignore
		const muteRole = await this._client.commands.handler.get('mute').getMuteRole(guild);
		if (this.timeLeft <= 0) {
			member.roles.remove(muteRole, 'Duration for mute has ended');
		}
		await this.delete();
	}

	public async update() {
		await new Promise(resolve => setTimeout(resolve, 120));
		if (this.timeLeft <= 0 && this._client.scheduler.has(this.endTime)) return this.end();
	}
}
