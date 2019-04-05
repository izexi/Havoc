const Command = require("../../structures/Command");
const Util = require("../../util/Util");
const moment = require("moment");
const { find } = require("node-emoji");
const { Emoji: djsEmoji } = require("discord.js");

class Emoji extends Command {
	constructor() {
		super(__filename, {
			description: "View info about an emoji.",
			args: {
				usage: "<emoji | emoji ID | emoji name >",
			},
			prompt: {
				initialMsg: ["enter the emoji that you would like info about."],
				validateFn: (msg) => Util.emojiRegex.test(msg.content) || Util.idRegex.test(msg.content) || find(msg.content),
				invalidResponseMsg: "You need to enter a valid emoji in this server",
			},
			opts: 0b1000,
		});
	}

	async run() {
		const possibleEmoji = this.text || this.promptResponse[0];
		const emojiID = (possibleEmoji.match(Util.emojiRegex) || [])[3] ||
            (possibleEmoji.match(Util.idRegex) || [])[0];
		const emoji = this.client.emojis.get(emojiID) || find(possibleEmoji);
		let embed;
		if (!emoji) {
			embed = {
				setDescription: `**${this.author.tag}** you have entered an ${emojiID ? "emoji that I cannot find" : "invalid emoji"}.`,
			};
		}
		if (emoji instanceof djsEmoji) {
			embed = {
				setThumbnail: emoji.url,
				addField: [
					["❯Emoji", emoji.toString(), true],
					["❯Name", "`:" + emoji.name + ":`", true],
					["❯ID", emoji.id, true],
					["❯Created at", moment(emoji.createdAt).format("LLLL"), true],
					["❯URL", emoji.url, true],
				],
			};
		}
		else if (emoji) {
			embed = {
				addField: [
					["❯Emoji", `\`${emoji.emoji}\` ${emoji.emoji}`, true],
					["❯Name", "`:" + emoji.key + ":`", true],
				],
			};
		}
		this.response = await this.sendEmbed(embed);
	}
}

module.exports = Emoji;