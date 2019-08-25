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
			args: [{ type: 'user' }],
			examples: {
				'': 'responds with your avatar along with the URL',
				'@Havoc': 'responds with Havoc\'s avatar along with the URL'
			}
		});
	}

	public async run(this: HavocClient, { msg, target: { user } }: { msg: HavocMessage; target: { user: HavocUser } }) {
		if (!user) user = msg.author;
		const avatar = user.pfp;
		msg.send(msg.text && !user ? `I couldn't find \`${Util.cleanContent(msg.text, msg)}\`... so here's yours?` : '',
			msg.constructEmbed({
				setDescription: `[URL for ${user.id === msg.author.id ? 'your' : `${user.tag}'s`} avatar](${avatar})`,
				setImage: avatar,
				setThumbnail: avatar
			}));
	}
}
