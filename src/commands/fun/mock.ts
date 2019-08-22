import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';

export default class Mock extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b1011,
			description: 'DiSpLaYs tExT LiKe tHiS',
			aliases: new Set(['emb']),
			args: [{
				type: 'string',
				prompt: { initialMsg: 'enter the text that you would like to mock.' }
			}],
			examples: { havoc: 'HaVoC' }
		});
	}

	public async run(this: HavocClient, { msg, target: { string } }: { msg: HavocMessage; target: { string: string } }) {
		msg.channel.send(string.replace(/./g, (letter, i) => i % 2 ? letter : letter.toUpperCase()), { disableEveryone: true });
	}
}
