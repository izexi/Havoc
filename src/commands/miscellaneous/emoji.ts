import { Emoji as nodeEmoji } from 'node-emoji';
import { GuildEmoji } from 'discord.js';
import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import * as moment from 'moment';
import Targetter from '../../util/Targetter';

export default class Emoji extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b1000,
			description: 'View info about an emoji.',
			target: 'emoji',
			prompt: {
				initialMsg: ['enter the emoji that you would like info about.'],
				validateFn: (msg: HavocMessage, str: string): boolean => Boolean(Targetter.emoji.get(str, msg.guild)),
				invalidResponseMsg: 'You need to enter a valid emoji in this server'
			}
		});
	}

	public async run(this: HavocClient, { msg, targetObj: { target } }: { msg: HavocMessage; targetObj: { target: GuildEmoji | nodeEmoji } }) {
		const emoji = target;
		let embed;
		if (emoji instanceof GuildEmoji) {
			embed = {
				setThumbnail: emoji.url,
				addField: [
					['❯Emoji', emoji.toString(), true],
					['❯Name', `\`:${emoji.name}:\``, true],
					['❯ID', emoji.id, true],
					['❯Created by', (await emoji.fetchAuthor()).tag, true],
					['❯Created at', moment(emoji.createdAt).format('LLLL'), true],
					['❯URL', emoji.url, true]
				]
			};
		} else {
			embed = {
				addField: [
					['❯Emoji', `\`${emoji.emoji}\` ${emoji.emoji}`, true],
					['❯Name', `\`:${emoji.key}:\``, true]
				]
			};
		}
		msg.response = await msg.sendEmbed(embed);
	}
}
