import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';

export default class Ping extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b0011,
			description: 'View the heartbeat/latency in ms.'
		});
	}

	public async run(this: HavocClient, { msg }: { msg: HavocMessage }) {
		const message = await msg.respond(await msg.sendEmbed({
			setTitle: '🏸 Pinging...'
		}));
		message.edit(
			msg.constructEmbed({
				setTitle: '🏓 Pong!',
				setDescription: `Latency: ${msg.response!.createdTimestamp - msg.createdTimestamp}ms\nHeartbeat: ${~~(this.ws.ping)}ms`
			})
		);
	}
}
