const { Collection } = require("discord.js");
const { promisify } = require("util");
const readdir = promisify(require("fs").readdir);
const Logger = require("../util/Logger");

class Commands extends Collection {
	constructor(...args) {
		super(...args);
		this._loadCommands();
	}

	async _loadCommands() {
		const commandFiles = (await readdir("./commands")).reduce(async (files, dirs) => {
			if (files instanceof Promise) files = await files;
			(await readdir("./commands/" + dirs))
				.map((file) => files.add(`../commands/${dirs}/${file}`));
			return files;
		}, Promise.resolve(new Set()));

		for (const commandFile of await commandFiles) {
			try {
				const command = new (require(commandFile))();
				this.set(command.name, command);
			}
			catch(err) {
				Logger.error(`Error while importing file - ${commandFile}`, err);
			}
		}
	}


	get(possibleCommand) {
		possibleCommand = possibleCommand.toLowerCase();
		return super.get(possibleCommand) ||
			super.find((c) => c.aliases && c.aliases.has(possibleCommand));
	}
}

module.exports = Commands;