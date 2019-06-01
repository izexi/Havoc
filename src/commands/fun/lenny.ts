import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';

export default class Lenny extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b0011,
			description: '( ͡° ͜ʖ ͡°)',
			aliases: new Set(['( ͡° ͜ʖ ͡°)'])
		});
	}

	public async run(this: HavocClient, { msg }: { msg: HavocMessage }) {
		msg.response = await msg.channel.send('( ͡° ͜ʖ ͡°)') as HavocMessage;
	}
}
