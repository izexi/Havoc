const { Client } = require("discord.js");
const { token } = require("../config.json");
const { parse } = require("json-buffer");
const Logger = require("./util/Logger");
const Commands = require("./structures/Commands");
const Database = require("./structures/Database");
const MessageHandler = require("./structures/MessageHandler");

class Havoc extends Client {
	constructor(...args) {
		super(...args);
		this.commands = new Commands();
		this.ownerID = "191615925336670208";
		this._init();
	}

	_init() {
		this.db = new Database();
		this.login(token)
			.then(() => Logger.status(`Logged in as ${this.user.tag}`))
			.catch((err) => Logger.error("Error while logging in", err));
		this
			.on("ready", () => {
				this.user.setActivity("you", { type: "WATCHING" });
				this.user.setStatus("offline");
				Logger.log(`${this.user.tag} is ready in ${this.guilds.size} guilds.`);
			})
			.on("message", (msg) => new MessageHandler(msg))
			.on("messageDelete", (msg) => {
				if (msg.command && (msg.response || msg.command.opts & 1)) {
					msg.response.delete();
				}
			})
			.on("messageUpdate", (oMsg, nMsg) => {
				if (!oMsg.command) return new MessageHandler(nMsg);
				if (oMsg.command && oMsg.command.opts & 1 << 1 && oMsg.response) {
					oMsg.response.delete();
					if (nMsg.command && nMsg.command.opts & 1 << 1 && nMsg.reply) {
						new MessageHandler(nMsg);
					}
				}
			});
		this.setInterval(() => {
			this.db.category = "poll";
			this.db.lessThan(Date.now())
				.then((res) => {
					if (!res) return;
					const { key, value } = res;
					const { channel, message, options } = parse(value);
					this.channels.get(channel).messages.fetch(message)
						.then((msg) => msg.endPoll(options))
						.catch(() => null);
					this.db.delete(key.slice(5));
				});
		}, 5000);
		process.on("unhandledRejection", (rej) => Logger.unhandledRejection(rej));
	}
}

module.exports = Havoc;