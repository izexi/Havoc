import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import HavocUser from '../../extensions/User';
import EmbedPagination from '../../structures/EmbedPagination';

export default class WarnList extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b1000,
			description: 'View the your / inputted member\'s warning(s) in the guild.',
			aliases: new Set(['warns', 'wl', 'warnl']),
			args: [{
				type: 'user',
				prompt: { initialMsg: 'mention the user / enter the users\'s ID, tag, nickname or username whose warnings you would like to view.' }
			}],
			userPerms: { flags: 'MANAGE_GUILD' },
			examples: { '{user}': 'view all warnings from the mentioned member' }
		});
	}

	public async run(this: HavocClient, { msg, target: { user } }: { msg: HavocMessage; target: { user: HavocUser } }) {
		this.db.category = 'warn';
		const warned = await this.db.get(user.id + msg.guild.id);
		if (!warned) {
			return msg.respond(`\`${user.tag}\` has \`0\` warnings in this server.`);
		}
		const descriptions: string[] = await Promise.all(warned
			.map(async ({ warner, reason }: { warner: string; reason: string }) =>
				`**Warned By:** ${(await this.users.fetch(warner)).tag}${reason ? `\n**Reason:** ${reason}` : ''}`));
		new EmbedPagination({
			msg,
			title: `${user.tag}'s warns`,
			descriptions,
			maxPerPage: 1,
			thumbnails: Array(warned.length).fill(user.displayAvatarURL()),
			page: Number(msg.args[1])
		});
	}
}
