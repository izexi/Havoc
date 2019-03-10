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
		this.sendEmbed({
			setTitle: "🏸 Pinging...",
		}).then((msg) => {
			msg.edit(
				this.constructEmbed({
					setTitle: "🏓 Pong!",
					setDescription: `Latency: ${msg.createdTimestamp - this.createdTimestamp}ms
                        Heartbeat: ${~~(this.client.ws.ping)}ms`,
				})
			);
		});
	}
}

module.exports = Invite;