const { plural } = require("../../util/Util");
const Command = require("../../structures/Command");
const EmbedPagination = require("../../structures/EmbedPagination");

class EmojiList extends Command {
	constructor() {
		super(__filename, {
			description: "View a list of emojis on this server.",
			aliases: new Set(["el", "elist", "emojis"]),
			args: {
				usage: "[page]",
			},
			opts: 0b0000,
		});
	}

	async run() {
		const emojis = this.guild.emojis;
		const emojiFormat = (emoji) => `• ${emoji.toString()} - \`:${emoji.name}:\``;
		new EmbedPagination({
			msg: this,
			title: `List of ${emojis.size} ${plural("emoji", emojis.size)} in ${this.guild.name}`,
			descriptionsArr: ["__**Emojis**__\n",
				...emojis.filter((emoji) => !emoji.animated).map(emojiFormat),
				"\n__**Animated Emojis**__\n",
				...emojis.filter((emoji) => emoji.animated).map(emojiFormat)],
			maxPerPage: 20,
			page: +this.args[1],
			hastebin: {
				url: `https://api-havoc.tk/emojis/${this.guild.id}?nocache=${Date.now()}`,
				text: "a full list of all the emojis in this server",
			},
		});
	}
}

module.exports = EmojiList;