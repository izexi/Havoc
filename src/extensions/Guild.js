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

		get config() {
			this.client.db.category = "config";
			return this.client.db.get(this.id)
				.then((res) => res || {})
				.catch(() => ({}));
		}

		async updateConfig(obj) {
			this.client.db.category = "config";
			this.client.db.set(this.id, { ...(await this.config), ...obj });
		}
	}

	return HavocGuild;
});