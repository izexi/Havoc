import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import EmbedPagination from '../../structures/EmbedPagination';
import Util from '../../util/Util';

export default class RoleList extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b0011,
			description: 'View a list of roles on the server.',
			aliases: new Set(['rl', 'roles', 'roleslist'])
		});
	}

	public async run(this: HavocClient, { msg }: { msg: HavocMessage }) {
		const roles = msg.guild.roles
			.filter(role => role.id !== msg.guild.id)
			.sort((a, b) => b.position - a.position);
		new EmbedPagination({
			msg: msg,
			title: `List of ${roles.size} ${Util.plural('role', roles.size)} in ${msg.guild.name}`,
			descriptions: roles.map(role => `• ${role.name}`),
			maxPerPage: 20,
			page: Number(msg.args[0])
		});
	}
}
