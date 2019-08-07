import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import HavocTextChannel from '../../extensions/TextChannel';
import { getSuggestionChannel } from './suggestion';
import { review } from './suggestion-approve';

export default class SuggestionApprove extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b1000,
			description: 'Denies a suggestion with an optional reason.',
			aliases: new Set(['s-approve', 'suggest-approve', 'suggestions-approve']),
			args: [{
				key: 'suggestion',
				type: async (msg: HavocMessage) => {
					const suggestionChannel = await getSuggestionChannel(msg) as HavocTextChannel;
					if (!suggestionChannel) return null;
					return suggestionChannel.messages.fetch(msg.arg)
						.then(() => msg.content)
						.catch(() => null);
				},
				prompt: { initialMsg: 'enter the ID of the suggestion which you can find on the footer of the suggestion\'s embed, followed by the reason of denial (optional)' }
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

	public async run(this: HavocClient, { msg, target: { suggestion } }: { msg: HavocMessage; target: { suggestion: string } }) {
		// eslint-disable-next-line promise/catch-or-return
		msg.delete().then(async () => review(msg, suggestion, false));
	}
}
