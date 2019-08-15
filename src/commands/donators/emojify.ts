import { Util } from 'discord.js';
import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';

export default class Emojify extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b1000,
			description: 'Enlarges inputted emoji into a HavocEmoji embed',
			args: [{
				key: 'emoji',
				type: (msg: HavocMessage) => {
					const emoji = Util.parseEmoji(msg.arg);
					if (emoji) return `https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? 'gif' : 'png'}`;
				},
				prompt: { initialMsg: 'enter the emoji that you would like enlarge.' }
			}]
		});
	}

	public async run(this: HavocClient, { msg, target: { emoji } }: { msg: HavocMessage; target: { emoji: string } }) {
		const embed = msg.constructEmbed({
			setImage: emoji,
			setAuthor: [msg.member!.displayName, msg.author.pfp]
			// @ts-ignore
		}).setTimestamp(null);
		// @ts-ignore
		msg.sendEmbed(embed.setFooter(msg.text ? Util.cleanContent(msg.text, msg) : '', null));
	}
}
