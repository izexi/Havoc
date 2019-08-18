import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import { Message } from 'discord.js';
import Util from '../../util/Util';

export default class Botclear extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b0010,
			description: 'Deletes recent bot messages & messages that contain bot commands (messages that start with popular bot prefixes along with the configured prefixes) to keep the chat clean.',
			aliases: new Set(['bc']),
			flags: new Set(['bots', 'commands']),
			userPerms: { flags: 'MANAGE_MESSAGES' },
			usage: [
				'<{prefix}bots | {prefix}commands>',
				'<config> [view]',
				'<config> [add] [prefix]',
				'<config> [remove] [prefix]'
			],
			examples: {
				'': 'deletes recent bot messages & messages that contain bot commands (messages that start with popular bot prefixes along with the configured prefixes)',
				'{prefix}bots': 'deletes recent bot messages',
				'{prefix}commands': 'deletes recent messages that contain bot commands (messages that start with popular bot prefixes along with the configured prefixes)',
				'config view': 'view the list of bot prefixes that will be cleared on messages that start with them',
				'config add ;': 'adds `;` to the list of bot prefixes that will be cleared on messages that start with it',
				'config remove ;': 'removes `;` to the list of bot prefixes that will be cleared on messages that start with it'
			}
		});
	}

	public async run(this: HavocClient, { msg, flag }: { msg: HavocMessage; flag: string }) {
		if (msg.arg === 'config') {
			msg.args.shift();
			return this.commands.handler.handle(msg, this.commands.get('botclear-config')!);
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
