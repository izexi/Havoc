const { version } = require("discord.js");
const Command = require("../../structures/Command");
const prettyMs = require("pretty-ms");

class Info extends Command {
	constructor() {
		super(__filename, {
			description: "Embeds the inputted text.",
			aliases: new Set(["i", "stats"]),
			opts: 0b0011,
		});
	}

	async run() {
		const getVoteLink = () => {
			return this.client.guilds.get("406873117215031297").members.fetch(this.author)
				.then(() => "https://discordapp.com/channels/406873117215031297/406873578458447873/535928285402628106")
				.catch(() => "http://www.bridgeurl.com/vote-for-havoc/all");
		};
		this.response = await this.sendEmbed({
			setTitle: this.client.user.username,
			addField: {
				0: ["❯Links",
					`- [Invite me](https://discordapp.com/oauth2/authorize?client_id=${this.client.user.id}&scope=bot&permissions=2146958591)
					- [Vote for me](${await getVoteLink()})
					- [Support server](https://discord.gg/3Fewsxq)`, true],
				1: ["❯Uptime", prettyMs(this.client.uptime), true],
				2: ["❯Memory usage", (process.memoryUsage().heapUsed / 1048576).toFixed(2) + "MB", true],
				3: ["❯Totals",
					`- Servers: ${this.client.guilds.size}
					- Users: ${"~" + this.client.guilds.reduce((total, guild) => total + guild.memberCount, 0)}
					- Cached users: ${this.client.users.size}
					- Channels: ${this.client.channels.size}
					- Cached messages: ${this.client.channels.filter((channel) => channel.messages).reduce((total, channel) => total + channel.messages.size, 0)}`, true],
				4: ["❯Github", "[Click here](link)", true],
				5: ["❯Versions",
					`- [discord.js](https://github.com/discordjs/discord.js): v${version}
					- Node.js: ${process.version}`, true],
			},
		});
	}
}

module.exports = Info;