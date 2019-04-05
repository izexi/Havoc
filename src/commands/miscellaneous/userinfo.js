const { Util: { cleanContent } } = require("discord.js");
const Command = require("../../structures/Command");
const moment = require("moment");

class UserInfo extends Command {
	constructor() {
		super(__filename, {
			description: "View info about a user.",
			aliases: new Set(["uinfo", "user"]),
			args: {
				usage: "<mention | username | nickname | tag | ID>",
				user: true,
			},
			opts: 0b0111,
		});
	}

	async run(opts) {
		const { target, possibleTarget } = await opts;
		const user = target || this.author;
		const member = this.member;
		const fields = [
			["❯Tag", user.tag, true],
			["❯ID", user.id, true],
			["❯Status", user.presence.status.replace(/./, (letter) => letter.toUpperCase()), true],
		];
		if (member) {
			fields.push(["❯Joined server at", moment(member.joinedAt).format("LLLL"), true]);
			if (member.roles.size > 1) {
				fields.push["Roles",
				member.roles
					.filter((role) => role.id !== this.guild.id)
					.sort((a, b) => b.position - a.position)
					.map((role) => role.toString())
					.join(", "),
				true];
			}
		}
		if (user.presence.game) fields.push(["❯Playing", user.presence.game.name, true]);
		this.response = await this.sendEmbed({
			setThumbnail: user.pfp,
			addField: fields,
		}, possibleTarget && !target ?
			`I couldn't find \`${cleanContent(possibleTarget, this)}\`... so here's yours?` : "");
	}
}

module.exports = UserInfo;