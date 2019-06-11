import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import { GuildChannel } from 'discord.js';
import HavocTextChannel from '../../extensions/TextChannel';
import Util from '../../util/Util';
import Regex from '../../util/Regex';

const getSuggestionChannel = async (msg: HavocMessage) => {
	const existing = msg.guild.channels.find((channel: GuildChannel) => channel.name === 'suggestions');
	const { suggestion } = await msg.guild.config;
	if (!suggestion) {
		if (!existing) {
			msg.response = await msg.sendEmbed({
				setDescription: `**${msg.author.tag}** I couldn't find a \`#suggestions\` and a suggestion channel hasn't been configured.
				${msg.member!.permissions.has('MANAGE_GUILD') ? 'U' : 'You will need to ask someone with the `Manage Guild` permission to u'}se \`${msg.prefix}suggestion config\` to set one up.`
			});
			return null;
		}
		return existing;
	}
	const { channel } = suggestion;
	const suggestionChannel = msg.guild.channels.get(channel);
	if (!suggestionChannel) {
		msg.response = await msg.sendEmbed({
			setDescription: `**${msg.author.tag}** the suggestion channel that was in the configuration doesn't exist.
			${msg.member!.permissions.has('MANAGE_GUILD') ? 'U' : 'You will need to ask someone with the `Manage Guild` permission to u'}se \`${msg.prefix}suggestion config\` to set one up.`
		});
		return null;
	}
	return suggestionChannel;
};


export async function review(_msg: HavocMessage, text: string, approve: boolean) {
	const suggestionChannel = await getSuggestionChannel(_msg);
	const [messageID, ...reason] = text.split(/ +/);
	const invalidID = async () => _msg.sendEmbed({
		setDescription: `**${_msg.author.tag}** you have entered an invalid Suggestion ID.`,
		setImage: 'https://i.imgur.com/IK7JkVw.png'
	});
	const reviewReason = reason.join(' ');
	(suggestionChannel as HavocTextChannel).messages.fetch(messageID).then(async msg => {
		const [embed] = msg.embeds;
		if (!embed || !embed.footer || !embed.footer.text || !embed.footer.text.startsWith('Suggestion') || msg.author!.id !== _msg.client.user!.id) return _msg.response = await invalidID();
		if (embed.fields[1].value !== 'Open') {
			return _msg.response = await _msg.sendEmbed({
				setDescription: `**${_msg.author.tag}** _msg suggestion has already been ${Util.captialise(embed.fields[1].value.split(' -')[0])}.`
			});
		}
		embed.fields[1].value = `${approve ? 'Approved' : 'Denied'} by ${_msg.author.tag}${reviewReason ? ` - ${reviewReason}` : ''}`;
		embed.setColor(approve ? 'GREEN' : 'RED');
		// eslint-disable-next-line promise/catch-or-return
		await msg.edit(embed);
		const [userID]: RegExpMatchArray = embed.author!.name!.match(Regex.id) || [];
		embed.setAuthor(`💡Your suggestion in ${msg.guild!.name} has been ${approve ? 'accepted' : 'denied'}💡`);
		embed.setDescription(`\n\nClick [here](${msg.url}) to view it.`);
		// eslint-disable-next-line promise/no-nesting
		_msg.client.users.fetch(userID)
			.then(async user => user.send(embed))
			.catch(() => null);
	}).catch(async () => _msg.response = await invalidID());
}

export default class SuggestionApprove extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b1000,
			description: 'Approves a suggestion with an optional reason.',
			aliases: new Set(['s-approve', 'suggest-approve', 'suggestions-approve']),
			args: [{
				key: 'suggestionMsg',
				type: async (msg: HavocMessage) => {
					const suggestionChannel = await getSuggestionChannel(msg) as HavocTextChannel;
					if (!suggestionChannel) return null;
					return suggestionChannel.messages.fetch(msg.args[0])
						.then(() => msg.content)
						.catch(() => null);
				},
				prompt: { initialMsg: 'enter the ID of the suggestion which you can find on the footer of the suggestion\'s embed, followed by the reason of approval (optional)' }
			}],
			userPerms: {
				role: async (msg: HavocMessage) => {
					const { suggestion } = await msg.guild.config;
					const { role }: { role: string } = suggestion || {};
					return role;
				},
				flags: ['MANAGE_GUILD']
			}
		});
	}

	public async run(this: HavocClient, { msg, target: { suggestion } }: { msg: HavocMessage; target: { suggestion: string } }) {
		// eslint-disable-next-line promise/catch-or-return
		msg.delete().then(async () => review(msg, suggestion, true));
	}
}
