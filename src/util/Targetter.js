const Util = require("./Util");

class Targetter {

	static _format(target, found) {
		return {
			target,
			found,
		};
	}

	/** @param {import("discord.js").Guild} guild */
	static _mentionOrIDSearch(str, guild) {
		const target = (str.match(`(${Util.userMentionRegex.source})|(${Util.idRegex.source})`) || [])[0];
		if (!target) return;
		const id = target.match(/\d+/)[0];
		return guild.members.fetch(id)
			.then((member) => this._format(target, member))
			.catch(() => null);
	}

	/** @param {import("discord.js").Client} client */
	static _globalUserSearch(str, client) {
		if (!str) return null;
		let target = (str.match(`(${Util.userMentionRegex.source})|(${Util.idRegex.source})`) || [])[0];
		if (!target) {
			target = str.match(Util.userTagRegex);
			if (!target) return null;
			const found = client.users.find((user) => user.tag.toLowerCase() === target);
			return found ? this._format(target, found) : null;
		}
		const id = target.match(/\d+/)[0];
		return client.users.fetch(id)
			.then((user) => this._format(target, user))
			.catch(() => null);
	}

	/** @param {import("discord.js").Guild} guild */
	static _memberSearch(str, guild) {
		const target = (str.match(`(${Util.userTagRegex.source})|(${Util.usernameRegex.source})`) || [])[0];
		if (!target) return null;
		return guild.members.find((member) => member.user.username.toLowerCase() === str) ||
			guild.members.fetch({ cache: false })
				.then((members) =>
					members.find((member) => member.user.username.toLowerCase() === str ||
						member.displayName.toLowerCase() === str)
				).catch(() => null) || null;
	}

	/** @param {import("discord.js").Guild} guild */
	static _looseSearch(str, guild) {
		return guild.members.find((member) =>
			member.displayName.toLowerCase().includes(str) ||
				member.user.username.toLowerCase().includes(str)
		);
	}

	static async getTarget(opts) {
		const { str, guild, client, guildOnly } = opts;
		if (!str) return null;
		let found;
		if (guild) {
			found = await this._mentionOrIDSearch(str, guild) ||
				await this._memberSearch(str, guild) ||
				this._looseSearch(str, guild);
		}
		if (!found && !guildOnly) found = this._globalUserSearch(str, guild ? guild.client : client);
		return found;
	}

}

module.exports = Targetter;