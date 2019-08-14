import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import { handleMessage } from '../../events/message';
import { Message } from 'discord.js';
import Util from '../../util/Util';

export default class Botclear extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b0010,
			description: 'Deletes recent bot messages & messages that contain bot commands (messages that start with popular bot prefixes) to keep the chat clean.',
			aliases: new Set(['bc']),
			flags: new Set(['bots', 'commands']),
			userPerms: { flags: 'MANAGE_MESSAGES' }
		});
	}

	public async run(this: HavocClient, { msg, flag }: { msg: HavocMessage; flag: string }) {
		if (msg.arg === 'config') {
			msg.args.shift();
			return handleMessage(this, msg, this.commands.get('botclear-config')!);
		}
		const emojis = ['<:botclear1:486606839015014400>', '<:botclear2:486606870618963968>', '<:botclear3:486606906337525765>'];
		let { bcPrefixes }: { bcPrefixes: string[] } = await msg.guild.config;
		if (!bcPrefixes) bcPrefixes = [msg.prefix, '!', '.'];
		let filter = (message: Message) => message.author!.bot || bcPrefixes.some(prefix => message.content.startsWith(prefix));
		if (flag) {
			filter = (message: Message) => flag === 'bots'
				? message.author!.bot
				: bcPrefixes.some(prefix => message.content.startsWith(prefix));
		}
		const messages = await msg.channel.messages.fetch({ limit: 100 });
		const cleared = await msg.channel.bulkDelete(messages.filter(filter), true);
		msg.sendEmbed({ setDescription: `**${msg.author.tag}** bot cleared \`${cleared.size} ${Util.plural('message', cleared.size)}\` ${emojis[Util.randomInt(0, emojis.length - 1)]}` })
			.then(async message => message.delete({ timeout: 1300 }))
			.catch(() => null);
	}
}
