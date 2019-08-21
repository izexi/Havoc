import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import Targetter from '../../util/Targetter';
import HavocUser from '../../extensions/User';
import Util from '../../util/Util';

export default class Clear extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b1000,
			description: 'Deletes a chosen amount of messages from a channel / from a user in a channel.',
			aliases: new Set(['c', 'prune', 'purge']),
			args: [{
				type: 'number',
				prompt: { initialMsg: 'Enter the amount of messages that you would like to clear.' }
			},
			{
				key: 'userOrNull',
				optional: true,
				type: async (msg: HavocMessage) => {
					if (msg.arg === 'none') return null;
					const { target } = await Targetter.getTarget('user', msg);
					if (target) return target;
				},
				prompt: {
					initialMsg: 'mention the user / enter the users\'s ID, tag, nickname or username who you would like to clear messages from or enter `None` if you don\'t want to clear messages from a specific user.',
					invalidResponseMsg: 'You need to enter a valid user or you can enter `None` if you would not like to provide a user.'
				}
			}],
			userPerms: { flags: 'MANAGE_MESSAGES' },
			usage: ['[number] <{user}>'],
			examples: {
				'10': 'clears the recent 10 messages in the channel',
				'10 {user}': 'clears the recent 10 messages from the corresponding user in the channel'
			}
		});
	}

	public async run(this: HavocClient, { msg, target: { number, userOrNull } }: { msg: HavocMessage; target: { number: number; userOrNull?: HavocUser | null } }) {
		const emojis = ['<:botclear1:486606839015014400>', '<:botclear2:486606870618963968>', '<:botclear3:486606906337525765>'];
		await msg.delete();
		let messages = await msg.channel.messages.fetch({ limit: 100 });
		if (userOrNull) {
			messages = messages.filter(message => message.author!.id === userOrNull.id);
		}
		const cleared = await msg.channel.bulkDelete(isNaN(number) ? messages : messages.first(Math.min(number, 100)), true);
		msg.respond(`cleared \`${cleared.size} ${Util.plural('message', cleared.size)}\` ${emojis[Util.randomInt(0, emojis.length - 1)]}`)
			.then(async message => message.delete({ timeout: 1300 }))
			.catch(() => null);
	}
}
