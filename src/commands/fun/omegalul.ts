import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';

export default class Omegalul extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b1011,
			description: 'Replaces any `o`s with <:omegalul:457981874531467265> in the inputted message.',
			args: [{
				type: 'string',
				prompt: { initialMsg: 'enter the text that you would like to replaces any `o`s with <:omegalul:457981874531467265>.' }
			}],
			examples: { havoc: 'hav<:omegalul:457981874531467265>c' }
		});
	}

	public async run(this: HavocClient, { msg, target: { string } }: { msg: HavocMessage; target: { string: string } }) {
		msg.respond(await msg.channel.send(string.replace(/o/g, '<:omegalul:457981874531467265>'), { disableEveryone: true }));
	}
}
