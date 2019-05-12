import Command from '../../structures/Command';
import { Message } from 'discord.js';

export default class Ping extends Command {
	public constructor() {
		super(__filename, {
			aliases: new Set(['test'])
		});
	}

	public run(msg: Message) {
		msg.channel.send('Pong!');
	}
}
