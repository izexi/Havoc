const Command = require("../../structures/Command");

class Invite extends Command {
	constructor() {
		super(__filename, {
			description: "View an invite link to invite me to a server.",
			aliases: new Set(["inv"]),
			opts: 0b0011,
		});
	}

	async run() {
		this.response = await this.sendEmbed({
			// eslint-disable-next-line max-len
			setDescription: `[Click here to invite **${this.client.user.username}** to your server.](https://discordapp.com/oauth2/authorize?client_id=${this.client.user.id}&scope=bot&permissions=2146958591)`,
		});
	}
}

module.exports = Invite;