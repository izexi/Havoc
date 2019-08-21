import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import HavocTextChannel from '../../extensions/TextChannel';
import { getSuggestionChannel } from './suggestion';
import { review } from './suggestion-approve';

export default class SuggestionDeny extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b1000,
			description: 'Denies a suggestion with an optional reason.',
			aliases: new Set(['s-deny', 'suggest-deny', 'suggestions-deny']),
			args: [{
				key: 'suggestionMsg',
				type: async (msg: HavocMessage) => {
					const suggestionChannel = await getSuggestionChannel(msg) as HavocTextChannel;
					if (!suggestionChannel) return null;
					return suggestionChannel.messages.fetch(msg.arg).catch(() => null);
				},
				prompt: {
					initialMsg: 'enter the ID of the suggestion which you can find on the footer of the suggestion\'s embed, followed by the reason of denial (optional)',
					invalidResponseMsg: 'I couldn\'t find any suggestions that corresponds the ID that you entered https://i.imgur.com/IK7JkVw.png'
				}
			},
			{
				key: 'reason',
				optional: true,
				type: 'string',
				prompt: { initialMsg: 'enter the reason for denial' }
			}],
			userPerms: {
				role: async (msg: HavocMessage) => {
					const { suggestion } = await msg.guild.config;
					const { role }: { role: string } = suggestion || {};
					return role;
				},
				flags: 'MANAGE_GUILD'
			}
		});
	}

	public async run(this: HavocClient, { msg, target: { suggestionMsg, reason } }: { msg: HavocMessage; target: { suggestionMsg: HavocMessage; reason: string } }) {
		// eslint-disable-next-line promise/catch-or-return
		msg.delete().then(async () => review(suggestionMsg, reason, false));
	}
}
