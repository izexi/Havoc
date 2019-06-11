import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';

export default class Embed extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b1011,
			description: 'Embeds the inputted text.',
			aliases: new Set(['emb']),
			args: [{
				type: 'string',
				prompt: { initialMsg: 'enter the text that you would like to embed.' }
			}]
		});
	}

	public async run(this: HavocClient, { msg, target: { string } }: { msg: HavocMessage; target: { string: string } }) {
		await msg.delete();
		msg.sendEmbed({
			setDescription: string,
			setFooter: [msg.author.tag, msg.author.pfp]
		});
	}
}
