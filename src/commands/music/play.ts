import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import ytdl from 'ytdl-core';

export default class Json extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b1000,
			description: 'This totally works.',
			args: [{
				key: 'song',
				type: 'string',
				prompt: {
					initialMsg: 'enter the song you would like to play.',
					invalidResponseMsg: 'You need to enter the song\'s name or a URL.'
				}
			}],
			usage: ['[song name or URL]'],
			examples: { 'https://www.youtube.com/watch?v=dQw4w9WgXcQ': 'plays the corresponding song' }
		});
	}

	public async run(this: HavocClient, { msg, target: { song } }: { msg: HavocMessage; target: { song: string } }) {
		if (!msg.member!.voice.channel) {
			return msg.sendEmbed({ setDescription: `**${msg.author.tag}** you need to be in a voice channel to use this command.` });
		}
		/* eslint-disable no-irregular-whitespace */
		await msg.channel.send(`
			${msg.author}\nɴᴏᴡ ᴘʟᴀʏɪɴɢ: \`${song.substring(0, 32)}${song.length > 32 ? '...' : ''}\`
			:white_circle:───────────────────────────────────────────
			◄◄⠀▐▐ ⠀►►⠀⠀　　⠀ 0:00 / 1:37　　⠀ ───○ :loud_sound:⠀　　　ᴴᴰ :gear: ❐ ⊏⊐
		`);
		const connection = await msg.member!.voice.channel.join();
		connection.play(ytdl('https://www.youtube.com/watch?v=dQw4w9WgXcQ', { quality: 'highestaudio' }))
			.on('finish', () => msg.guild.voice!.channel!.leave());
	}
}
