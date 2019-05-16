import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../Havoc';

export default class Ping extends Command {
	public constructor() {
		super(__filename, {
			aliases: new Set(['test'])
		});
	}

	public run(this: HavocClient, msg: HavocMessage) {
		msg.channel.send('Pong!');
	}
}
