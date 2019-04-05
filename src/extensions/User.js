const { Structures } = require("discord.js");

module.exports = Structures.extend("User", (User) => {
	class HavocGuild extends User {
		constructor(...args) {
			super(...args);
		}

		get pfp() { // to make life easier
			return super.displayAvatarURL();
		}
	}

	return HavocGuild;
});