const fetch = require("node-fetch");

class Util {
	static prefixRegex(clientID, prefix) {
		return new RegExp(`^(<@!?${clientID}>|\\${prefix})\\s*`);
	}

	static mentionPrefixRegex(clientID) {
		return new RegExp(`^<@!?${clientID}>`);
	}

	static plural(str, int) {
		return str + (int > 1 ? "s" : "");
	}

	static get userMentionRegex() {
		return /<@!?(\d{17,19})>/g;
	}

	static get userTagRegex() {
		return /.{2,32}(#)\d{4}/g;
	}

	static get usernameRegex() {
		return /.{2,32}/g;
	}

	static get idRegex() {
		return /\d{17,19}/g;
	}

	static async haste(body, extension = "txt") {
		return fetch("https://hasteb.in/documents", { method: "POST", body })
			.then(async (res) => `https://hasteb.in/${(await res.json()).key}.${extension}`)
			.catch(() => {
				return fetch("https://paste.nomsy.net/documents", { method: "POST", body })
					.then(async (res) => `https://paste.nomsy.net/${(await res.json()).key}.${extension}`);
			});
	}
}

module.exports = Util;
