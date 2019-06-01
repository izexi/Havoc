import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';

export default class Mock extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b1011,
			description: 'DiSpLaYs tExT LiKe tHiS',
			aliases: new Set(['emb']),
			prompt: {
				initialMsg: ['enter the text that you would like to mock.']
			},
			target: 'string'
		});
	}

	public async run(this: HavocClient, { msg, targetObj: { target } }: { msg: HavocMessage; targetObj: { target: string } }) {
		msg.response = await msg.channel.send(target.replace(/./g, (letter, i) => i % 2 ? letter : letter.toUpperCase()), { disableEveryone: true }) as HavocMessage;
	}
}
