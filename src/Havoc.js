const { Client } = require("discord.js");
const { token } = require("../config.json");
const Logger = require("./util/Logger");
const Commands = require("./structures/Commands");
const MessageHandler = require("./structures/MessageHandler");

class Havoc extends Client {
	constructor(...args) {
		super(...args);
		this.commands = new Commands();
		this.ownerID = "191615925336670208";
		this._init();
	}

	_init() {
		this.login(token)
			.then(() => Logger.status(`Logged in as ${this.user.tag}`))
			.catch((err) => Logger.error("Error while logging in", err));
		this
			.on("ready", () => {
				this.user.setActivity("you", { type: "WATCHING" });
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
		process.on("unhandledRejection", (rej) => Logger.unhandledRejection(rej));
	}
}

module.exports = Havoc;