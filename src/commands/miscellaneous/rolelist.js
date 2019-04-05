const { plural } = require("../../util/Util");
const Command = require("../../structures/Command");
const EmbedPagination = require("../../structures/EmbedPagination");

class RoleList extends Command {
	constructor() {
		super(__filename, {
			description: "View a list of roles on the server.",
			aliases: new Set(["rl", "roles", "roleslist"]),
			opts: 0b0000,
		});
	}

	async run() {
		const roles = this.guild.roles
			.filter((role) => role.id !== this.guild.id)
			.sort((a, b) => b.position - a.position);
		new EmbedPagination({
			msg: this,
			title: `List of ${roles.size} ${plural("role", roles.size)} in ${this.guild.name}`,
			descriptionsArr: roles.map((role) => `• ${role.name}`),
			maxPerPage: 20,
			page: +this.args[0],
			hastebin: {
				url: `https://api-havoc.tk/roles/${this.guild.id}?nocache=${Date.now()}`,
				text: "a full list of all the roles in this server",
			},
		});
	}
}

module.exports = RoleList;