const { User, GuildMember } = require("discord.js");
const { prefixRegex } = require("../util/Util");
const Targetter = require("../util/Targetter");
const Prompt = require("../structures/Prompt");

class MessageHandler {
	constructor(msg) {
		this.msg = msg;
		this.commandCheck();
	}

	get client() {
		return this.msg.client;
	}

	get prefix() {
		const matchedPrefix = this.msg.content.match(prefixRegex(this.msg.client, this.msg.guild.prefix));
		return (matchedPrefix || [])[0];
	}

	async parseMsg(command) {
		const obj = {
			client: this.client,
			args: this.args,
		};
		if (command.opts & 1 << 3 && !this.args.length) {
			await new Promise((res) => {
				new Prompt({
					msg: this.msg,
					initialMsg: this.msg.command.prompt.initialMsg,
				}).on("promptResponse", (responses) => {
					this.msg.promptResponse = responses;
					res();
				});
			});
		}
		let options = this.args;
		if (command.opts & 1) {
			// eslint-disable-next-line prefer-const
			let { user, target } = (await Targetter.getTarget({
				str: options.join(" "),
				guild: this.msg.guild,
				client: this.client,
				guildOnly: this.msg.command.guildOnly,
			})) || {};
			if (user) {
				if (this.msg.command.args.user) {
					if (!(user instanceof User)) user = await this.client.users.fetch(user.id);
				}
				else if (!(user instanceof GuildMember)) {
					user = await this.msg.guild.members.fetch(user);
				}
			}
			obj.target = user;
			obj.possibleTarget = this.msg.args[1 + this.msg.argOffset];
			options = options.filter((arg) => arg !== target);
		}
		obj.options = options;
		if (command.flags) {
			const prefix = this.prefix;
			const flag = this.args.find((arg) => arg.startsWith(prefix) &&
				command.flags.has(arg.slice(prefix.length)));
			if (flag) {
				this.msg.flag = flag.slice(prefix.length);
				this.msg.args = this.msg.args.filter((arg) => arg !== flag);
				this.text = this.msg.args.join(" ");
			}
		}
		return obj;
	}

	commandCheck() {
		let prefix = this.msg.prefix;
		if (!prefix || this.msg.author.bot || this.webhookID) return;
		let possibleCommand, args;
		if (this.msg.mentionPrefix) {
			prefix = "";
			([, possibleCommand, ...args] = this.msg.args);
		}
		else {
			([possibleCommand, ...args] = this.msg.args);
		}
		this.args = args;
		const command = this.msg.client.commands.get(possibleCommand.slice(prefix.length));
		if (!command) return this.client.emit("unknownCommand", this.msg, possibleCommand);
		try {
			this.msg.assignCommand(command);
			this.parseMsg(command).then((parsedMsg) => {
				command.run.call(this.msg, parsedMsg);
				this.client.emit("commandExecuted", this.msg);
			});
		}
		catch(err) {
			this.client.emit("commandError", this.msg);
		}
	}
}

module.exports = MessageHandler;