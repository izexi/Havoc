import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import fetch from 'node-fetch';
import { Util } from 'discord.js';
import Responses from '../../util/Responses';
import { URL } from 'url';

export default class UploadEmoji extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b1000,
			description: 'Uploads the inputted custom emoji to the current server.',
			aliases: new Set(['uemoji']),
			args: [{
				key: 'emoji',
				type: async (msg: HavocMessage) => {
					const emoji = Util.parseEmoji(msg.arg);
					if (emoji && emoji.id) {
						return {
							url: `https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? 'gif' : 'png'}`,
							name: emoji.name
						};
					}
					try {
						new URL(msg.arg);
						const res = await fetch(msg.arg);
						if (!res.headers.get('content-type')!.includes('image')) return false;
						return { url: msg.arg };
					} catch (error) {
						return false;
					}
				},
				prompt: {
					initialMsg: 'enter the emoji or the URL of an image that you would like to upload as an emoji on this server.',
					invalidResponseMsg: 'You need to enter a valid direct image URL or a valid custom emoji.'
				}
			}, {
				key: 'emojiName',
				optional: true,
				type: 'string',
				prompt: { initialMsg: 'enter the name that you would like to assign for this emoji.' }
			}],
			userPerms: { flags: 'MANAGE_EMOJIS' },
			usage: [`[${Responses.usage('emoji')}] <emoji name>`],
			examples: {
				'https://cdn.discordapp.com/avatars/393848142585397248/24294285c3b57b10af4501a5413ece85.png havoc': 'uploads the corresponding emoji to the guild named "havoc"',
				'{emoji}': 'uploads the corresponding emoji to the guild named "emoji" as a default'
			}
		});
	}

	public async run(this: HavocClient, { msg, target: { emoji: { url, name }, emojiName } }: { msg: HavocMessage; target: { emoji: { url: string; name?: string }; emojiName: string } }) {
		const setDescription = await msg.guild.emojis.create(url, emojiName || name || 'emoji', { reason: `Created by ${msg.author.tag}` })
			.then(emoji => `**${msg.author.tag}** I have uploaded the emoji ${emoji} to this server.`)
			.catch(() => `**${msg.author.tag}** I encountered an error while trying to upload this emoji, either the file size of the emoji was too high or this server has reached its maximum emoji limit.`);
		msg.sendEmbed({ setDescription });
	}
}
