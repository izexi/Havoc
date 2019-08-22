import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import EmbedPagination from '../../structures/EmbedPagination';
/* eslint-disable @typescript-eslint/no-var-requires */
const { parse } = require('json-buffer');
const ms = require('ms');

export default class Servermutes extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b0011,
			description: 'View the currently muted users who are in the server.',
			aliases: new Set(['mutes'])
		});
	}

	public async run(this: HavocClient, { msg }: { msg: HavocMessage }) {
		const muted = await this.db.fieldQuery('mute', true, ['guild', msg.guild.id]);
		if (!muted.length) {
			return msg.respond('there are no members that are currently muted in this server');
		}
		const thumbnails: string[] = [];
		const descriptions: string[] = await Promise.all(muted
			.sort((a: { key: string }, b: { key: string }) => {
				if (a.key.split(':')[1] === '-1') return 1;
				if (b.key.split(':')[1] === '-1') return -1;
				return Number(a.key.split(':')[1]) - Number(b.key.split(':')[1]);
			})
			.map(async ({ value }: { value: string }) => {
				const { endTime, member, length, muter, reason } = parse(value);
				const desc = [];
				thumbnails.push((await this.users.fetch(member)).displayAvatarURL());
				desc.push(`**Muted User:** ${(await this.users.fetch(member)).tag}`);
				if (endTime !== -1) desc.push(`**Time Left:**  ${ms(endTime - Date.now(), { 'long': true })}`);
				desc.push(`**Mute Length:**  ${endTime === -1 ? '∞ minutes' : ms(length, { 'long': true })}`);
				desc.push(`**Muted By:** ${(await this.users.fetch(muter)).tag}`);
				if (reason) desc.push(`**Reason:** ${reason}`);
				return desc.join('\n');
			}));
		new EmbedPagination({
			msg,
			title: `Currently muted members`,
			descriptions,
			maxPerPage: 1,
			thumbnails,
			page: Number(msg.args[1])
		});
	}
}
