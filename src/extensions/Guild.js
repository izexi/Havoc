const { Structures } = require("discord.js");
const { prefix } = require("../../config.json");

module.exports = Structures.extend("Guild", (Guild) => {
	class HavocGuild extends Guild {
		constructor(...args) {
			super(...args);
			this.prefix = prefix;
		}

		get me() {
			return this.members.fetch(super.me)
				.then((member) => member)
				.catch(() => null);
		}
	}

	return HavocGuild;
});