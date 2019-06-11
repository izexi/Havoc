import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';

export default class Clap extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b1011,
			description: 'Displays👏text👏like👏this👏',
			aliases: new Set(['👏']),
			args: [{
				type: 'string',
				prompt: { initialMsg: 'enter the text that you would like to embed.' }
			}]
		});
	}

	public async run(this: HavocClient, { msg, target: { string } }: { msg: HavocMessage; target: { string: string } }) {
		msg.response = await msg.channel.send(string.replace(/ /g, '👏'), {
			split: { 'char': '👏' },
			disableEveryone: true
		}) as HavocMessage;
	}
}
