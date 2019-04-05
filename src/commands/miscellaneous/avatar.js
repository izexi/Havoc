const { Util: { cleanContent } } = require("discord.js");
const Command = require("../../structures/Command");

class Avatar extends Command {
	constructor() {
		super(__filename, {
			description: "View a user's avatar along with the URL.",
			aliases: new Set(["a", "av"]),
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
		const avatar = user.pfp;
		this.response = await this.sendEmbed({
			setDescription: `[URL for ${user.id === this.author.id ? "your" : `${user.tag}'s`} avatar](${avatar})`,
			setImage: avatar,
			setThumbnail: avatar,
		}, possibleTarget && !target ?
			`I couldn't find \`${cleanContent(possibleTarget, this)}\`... so here's yours?` : "");
	}
}

module.exports = Avatar;