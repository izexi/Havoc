const Command = require("../../structures/Command");

class MemberList extends Command {
	constructor() {
		super(__filename, {
			description: "View a list of members that have a certain role on this server.",
			aliases: new Set(["ml", "members", "memberslist"]),
			args: {
				usage: "<role> [page]",
			},
			prompt: {
				initialMsg: "enter the name of the role that you would like to list members from.",
			},
			opts: 0b1000,
		});
	}

	async run({ args }) {
		const { foundRole, restArgs } = args.reduce((obj, _, i, arr) => {
			if (obj.foundRole) return obj;
			const possibleRoleName = arr.slice(0, i + 1).join(" ");
			const possibleRole = this.guild.roles.find(
				(role) => role.name === possibleRoleName ||
                    role.name.toLowerCase() === possibleRoleName.toLowerCase()
			);
			if (!obj.foundRole && possibleRole) {
				obj.foundRole = possibleRole;
				obj.restArgs = arr.slice(i + 1);
			}
			return obj;
		}, { foundRole: null, restArgs: null }) || {};
		console.log(foundRole);
		console.log(restArgs);
		// TODO: paginate, usernames/tags/nicknames/ids flag?
	}
}

module.exports = MemberList;