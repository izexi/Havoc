const Command = require("../../structures/Command");
const moment = require("moment");

class ServerInfo extends Command {
	constructor() {
		super(__filename, {
			description: "View info about the server.",
			aliases: new Set(["sinfo", "server"]),
			opts: 0b0011,
		});
	}

	async run() {
		const guild = this.guild;
		this.response = await this.sendEmbed({
			setThumbnail: guild.iconURL() ||
                `https://placeholdit.imgix.net/~text?txtsize=50&txtfont=Whitney&w=128&h=128&bg=2f3136&txtclr=fff&txt=${guild.name.split(" ").map((name) => name[0]).join("")}`,
			addField: [
				["❯Name", guild.name, true],
				["❯Owner", (await this.client.users.fetch(guild.ownerID)).tag, true],
				["❯Members", guild.memberCount, true],
				["Roles", `${guild.roles.size} (You can view a list of all roles by doing \`${this.prefix}rolelist\`)`, true],
				["Emojis", `${guild.emojis.size} (You can view a list of all emojis by doing \`${this.prefix}emojilist\`)`, true],
				["Categories", guild.channels.filter((channel) => channel.type === "category").size, true],
				["Text channels", guild.channels.filter((channel) => channel.type === "text").size, true],
				["Voice channels", guild.channels.filter((channel) => channel.type === "voice").size, true],
				["Created at", moment(guild.createdAt).format("LLLL"), true],
				["Region", guild.region, true],
			],
		});
	}
}

module.exports = ServerInfo;