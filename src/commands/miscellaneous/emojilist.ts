import { GuildEmoji } from 'discord.js';
import Util from '../../util/Util';
import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import EmbedPagination from '../../structures/EmbedPagination';

export default class EmojiList extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b0000,
			description: 'View a list of emojis on this server.',
			aliases: new Set(['el', 'emojis', 'emojislist'])
		});
	}

	public async run(this: HavocClient, { msg }: { msg: HavocMessage }) {
		const emojis = msg.guild.emojis;
		const emojiFormat = (emoji: GuildEmoji) => `• ${emoji.toString()} - \`:${emoji.name}:\``;
		const [animated, normal] = emojis.partition((emoji: GuildEmoji) => emoji.animated);
		new EmbedPagination({
			msg,
			title: `List of ${emojis.size} ${Util.plural('emoji', emojis.size)} in ${msg.guild.name}`,
			descriptions: [
				'__**Emojis**__\n',
				...normal.map(emojiFormat),
				'\n__**Animated Emojis**__\n',
				...animated.map(emojiFormat)
			],
			maxPerPage: 20,
			page: Number(msg.args[1]),
			hastebin: true
		});
	}
}
