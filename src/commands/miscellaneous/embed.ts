import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';

export default class Embed extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b1011,
			description: 'Embeds the inputted text.',
			aliases: new Set(['emb']),
			prompt: {
				initialMsg: ['enter the text that you would like to embed.']
			},
			target: 'string'
		});
	}

	public async run(this: HavocClient, { msg, targetObj: { target } }: { msg: HavocMessage; targetObj: { target: string } }) {
		msg.response = await msg.sendEmbed({
			setDescription: target,
			setFooter: [msg.author.tag, msg.author.pfp]
		});
	}
}
