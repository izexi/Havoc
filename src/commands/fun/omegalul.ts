import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';

export default class Omegalul extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b1011,
			description: 'Replaces any `o`s with <:omegalul:457981874531467265> in the inputted message.',
			prompt: {
				initialMsg: ['enter the text that you would like to replaces any `o`s with <:omegalul:457981874531467265>.']
			},
			target: 'string'
		});
	}

	public async run(this: HavocClient, { msg, targetObj: { target } }: { msg: HavocMessage; targetObj: { target: string } }) {
		msg.response = await msg.channel.send(target.replace(/o/g, '<:omegalul:457981874531467265>'), { disableEveryone: true }) as HavocMessage;
	}
}
