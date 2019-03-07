const { haste } = require("../util/Util");
const { Structures, MessageEmbed } = require("discord.js");

module.exports = Structures.extend("TextChannel", (TextChannel) => {
	class HavocTextChannel extends TextChannel {
		constructor(...args) {
			super(...args);
		}

		async send(content, options) {
			if (options instanceof MessageEmbed) {
				let description = options.description;
				if (description && description.length > 2048) {
					description = await haste(description).catch(() => "The description was too long to be displayed");
					options.description = description;
				}
			}
			return super.send(content, options);
		}
	}

	return HavocTextChannel;
});