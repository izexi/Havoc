const { plural } = require("../../util/Util");
const { Util: djsUtil } = require("discord.js");
const Command = require("../../structures/Command");
const Targetter = require("../../util/Targetter");
const EmbedPagination = require("../../structures/EmbedPagination");

class MemberList extends Command {
	constructor() {
		super(__filename, {
			description: "View a list of members that have a certain role on this server.",
			aliases: new Set(["ml", "members", "memberslist"]),
			flags: new Set(["id", "tag", "username", "nickname"]),
			args: {
				usage: "<role mention | role ID | role name> [page]",
			},
			prompt: {
				initialMsg: "mention the role / enter the role's ID or name that you would like to list members from.",
			},
			opts: 0b1000,
		});
	}

	async run() {
		const flagObj = {
			id: ["id"],
			tag: ["user", "tag"],
			username: ["user", "username"],
			nickname: ["displayName"],
		};
		const { target: possiblePage, found: role } = Targetter.getRole({
			str: this.text,
			guild: this.guild,
		}) || {};
		if (!role) {
			return this.response = await this.sendEmbed({
				setDescription: `${this.author.tag} I could not find a role named \`${djsUtil.cleanContent(this.text, this)}\`.`,
			});
		}
		const roleMembers = await this.guild.members.fetch({ cache: false })
			.then((members) => members.filter((member) => member.roles.has(role.id)))
			.catch(() => null);
		if (!roleMembers) {
			return this.response = await this.sendEmbed({
				setDescription: `${this.author.tag} I encountered an error while trying to get a list of members that have the role \`${djsUtil.cleanContent(this.text, this)}\`.`,
			});
		}
		const flagOption = flagObj[this.flag] || ["displayName"];
		new EmbedPagination({
			msg: this,
			title: `List of ${roleMembers.size} ${plural("member", roleMembers.size)} that have the role \`${role.name}\``,
			descriptionsArr: roleMembers.map((member) => `• ${flagOption.reduce((obj, option) => obj[option], member)}`),
			maxPerPage: 20,
			page: +possiblePage,
			hastebin: {
				url: `https://api-havoc.tk/members/${this.guild.id}?nocache=${Date.now()}`,
				text: `a full list of all members that have the role ${role.name}`,
			},
		});
	}
}

module.exports = MemberList;