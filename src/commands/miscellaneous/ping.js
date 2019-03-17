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
			setTitle: "🏸 Pinging...",
		});
		this.response.edit(
			this.constructEmbed({
				setTitle: "🏓 Pong!",
				setDescription: `Latency: ${this.response.createdTimestamp - this.createdTimestamp}ms
                        Heartbeat: ${~~(this.client.ws.ping)}ms`,
			})
		);
	}
}

module.exports = Invite;