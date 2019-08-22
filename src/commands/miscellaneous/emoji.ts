import { Emoji as nodeEmoji } from 'node-emoji';
import { GuildEmoji } from 'discord.js';
import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import * as moment from 'moment';

export default class Emoji extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b1011,
			description: 'View info about an emoji.',
			args: [{
				type: 'emoji',
				prompt: { initialMsg: 'enter the emoji that you would like info about.' }
			}],
			examples: { weary: 'responds with your info about the 😩 emoji' }
		});
	}

	public async run(this: HavocClient, { msg, target: { emoji } }: { msg: HavocMessage; target: { emoji: GuildEmoji | nodeEmoji } }) {
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
		msg.respond(embed);
	}
}
