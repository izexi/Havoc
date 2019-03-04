const Command = require("../../structures/Command");

class Help extends Command {
	constructor() {
		super(__filename, {
			description: "Shows a list of all avaiable commands, or detailed info about a specific command.",
			aliases: new Set(["h"]),
			args: {
				usage: "[command]",
			},
			opts: 0b0011,
		});
	}

	async run() {
		const emojis = {
			"emojis": "<:emojis:466978216339570701>",
			"fun": "<:fun:407988457772810241>",
			"miscellaneous": "<:miscellaneous:404688801903017984>",
			"moderation": "<:moderation:407990341157912587>",
			"server": "🛠",
			"donators": "💸",
			"music": "🎶",
			"image": "🖼",
		};
		const categories = this.client.commands.reduce((uniqueCategories, { category }) => uniqueCategories.add(category), new Set());
		const fields = [...categories].reduce((obj, commandCategory, i) => {
			obj[i] = [
				`${emojis[commandCategory]} ${commandCategory.replace(/./, (firstLetter) => firstLetter.toUpperCase())}`,
				this.client.commands
					.filter(({ category }) => category === commandCategory)
					.map((command) => `\`${command.name}\``).join(", "),
			];
			return obj;
		}, {});
		this.response = await this.sendEmbed({
			setDescription: `You can view more info about a command by doing \`${this.prefix}help [command name]\`
                Click **[here](https://discord.gg/3Fewsxq)** to join the support server here
				Click **[here](https://discordapp.com/oauth2/authorize?client_id=${this.client.user.id}&scope=bot&permissions=2146958591)** to invite me to your server
				⠀`,
			addField: fields,
		});
	}
}

module.exports = Help;