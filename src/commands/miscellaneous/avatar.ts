import { Util } from 'discord.js';
import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import HavocUser from '../../extensions/User';

export default class Avatar extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b0011,
			description: 'View a user\'s avatar along with the URL.',
			aliases: new Set(['a', 'av']),
			target: 'user'
		});
	}

	public async run(this: HavocClient, { msg, targetObj: { target, loose } }: { msg: HavocMessage; targetObj: { target: HavocUser; loose: boolean } }) {
		const user = target || msg.author;
		const avatar = user.pfp;
		msg.response = await msg.sendEmbed({
			setDescription: `[URL for ${user.id === msg.author.id ? 'your' : `${loose ? user.tag.replace(new RegExp(msg.text, 'gi'), '**$&**') : user.tag}'s`} avatar](${avatar})`,
			setImage: avatar,
			setThumbnail: avatar
		}, msg.text && !target
			? `I couldn't find \`${Util.cleanContent(msg.text, msg)}\`... so here's yours?`
			: '');
	}
}
