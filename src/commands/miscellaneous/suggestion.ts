import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import { GuildChannel, SnowflakeUtil } from 'discord.js';
import Prompt from '../../structures/Prompt';
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


const review = async (_msg: HavocMessage, text: string, approve: boolean) => {
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
};

const validateAccess = async (msg: HavocMessage) => {
	const { suggestion } = await msg.guild.config;
	const { role }: { role: string } = suggestion || {};
	if (!msg.member!.permissions.has('MANAGE_GUILD') && !msg.member!.roles.has(role)) {
		const accessRole = msg.guild.roles.get(role);
		msg.response = await msg.sendEmbed({
			setDescription: `**${msg.author.tag}** you need to have the \`Manage Server\` permission to review suggestions or ${accessRole ? `the \`${accessRole.name}\` role` : `you can configure a role via \`${msg.prefix}suggestion config\``}.`
		});
		return false;
	}
	return true;
};

export default class Suggestion extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b1000,
			description: 'Creates a suggestion that will either be approved or denied.',
			aliases: new Set(['s', 'suggest']),
			subCommands: new Set(['config', 'approve', 'deny']),
			target: 'string',
			prompt: {
				initialMsg: ['enter the suggestion that you would like to create.']
			},
			subArgs: [{
				subCommand: ['approve', 'deny'],
				target: 'string',
				prompt: {
					initialMsg: ["enter the ID of the suggestion which you can find on the footer of the suggestion's embed, followed by the reason of approval (optional)"],
					validateFn: (msg: HavocMessage, str: string) => Regex.id.test(str),
					invalidResponseMsg: 'You have entered an invalid ID.'
				}
			},
			{
				subCommand: 'config',
				target: 'string',
				prompt: {
					initialMsg: ['what would you like to configure from suggestions?\nEnter `channel` / `role`.'],
					validateFn: (msg: HavocMessage, str: string) => ['channel', 'role'].includes(str.toLowerCase()),
					invalidResponseMsg: 'You will need to enter either `channel` or `role`.'
				}
			}]
		});
	}

	public async run(this: HavocClient, { msg, targetObj: { target } }: { msg: HavocMessage; targetObj: { target: string } }) {
		const suggestionChannel = await getSuggestionChannel(msg) as HavocTextChannel;
		if (!suggestionChannel) return;
		await msg.delete();
		const suggestion = target.length > 1853 ? await Util.haste(target, 'txt') : target;
		const suggestionMessage = await suggestionChannel.send(msg.constructEmbed({
			addField: [
				['Suggestion:', suggestion],
				['Status:', 'Open']
			],
			setAuthor: [`💡Suggestion from ${msg.author.tag} (${msg.author.id})💡`, msg.author.pfp],
			setColor: 'YELLOW',
			setFooter: `Suggestion ID: ${SnowflakeUtil.generate(new Date())}`
		}));
		await Promise.all([
			suggestionMessage.edit(suggestionMessage.embeds[0].setFooter(`Suggestion ID: ${suggestionMessage.id}`)),
			suggestionMessage.react('416985886509498369'),
			suggestionMessage.react('416985887616925726')
		]);
		const embed = msg.constructEmbed({
			setAuthor: `💡Your suggestion in ${msg.guild.name} has been submitted💡`,
			addField: [
				['Suggestion:', suggestion],
				['Status:', 'Open']
			],
			setDescription: `\n\nClick [here](${suggestionMessage.url}) to view it.\nYou will be notified about the status of approval/denial.`,
			setFooter: `Suggestion ID: ${suggestionMessage.id}`,
			setColor: 'YELLOW'
		});
		msg.author.send(embed).catch(() => {
			msg.sendEmbed({
				setDescription: `**${msg.author.tag}** your suggestion has been submitted, click [here](${suggestionMessage.url}) to view it.\nI was unable to DM you so you will need to enable them if you will be notified about the status of approval/denial.`
			});
		});
	}

	public async approve(this: HavocClient, { msg, targetObj: { target } }: { msg: HavocMessage; targetObj: { target: string } }) {
		if (!await validateAccess(msg)) return;
		// eslint-disable-next-line promise/catch-or-return
		msg.delete().then(async () => review(msg, target, true));
	}

	public async deny(this: HavocClient, { msg, targetObj: { target } }: { msg: HavocMessage; targetObj: { target: string } }) {
		if (!await validateAccess(msg)) return;
		// eslint-disable-next-line promise/catch-or-return
		msg.delete().then(async () => review(msg, target, false));
	}

	public async config(this: HavocClient, { msg, targetObj: { target } }: { msg: HavocMessage; targetObj: { target: string } }) {
		const { suggestion } = await msg.guild.config;
		let initialMsg: string[];
		let invalidResponseMsg: string;
		let validateFn: Function;
		let update: Function;
		if (target.split(' ')[0] === 'channel') {
			initialMsg = ['mention the channel, or enter the ID of the channel that would like the suggestions to be created on.'];
			// eslint-disable-next-line no-shadow
			validateFn = (msg: HavocMessage, str: string) => msg.mentions.channels.size || msg.guild.channels.has(str);
			invalidResponseMsg = `You will need to mention the channel (e.g: ${msg.channel}) or enter the channel's ID (e.g: ${msg.channel.id}).`;
			update = async (channel: string) => {
				await msg.guild.updateConfig({ suggestion: { ...suggestion, channel: channel.match(/\d+/)![0] } });
				msg.sendEmbed({
					setDescription: `**${msg.author.tag}** I have updated the suggestions channel to ${channel.startsWith('<') ? channel : `<#${channel}>`} for this server.`
				});
			};
		} else {
			const randomRole = msg.guild.roles.random()!;
			initialMsg = ['mention the role, or enter the name of the role that you would like to give access for deny/approving suggestions.'];
			// eslint-disable-next-line no-shadow
			validateFn = (msg: HavocMessage, str: string) => msg.mentions.roles.size || msg.guild.roles.some(role => role.name.toLowerCase() === str);
			invalidResponseMsg = `You will need to mention the role (e.g: ${randomRole}) or enter the role's name (e.g: ${randomRole.name}).`;
			update = async (role: string) => {
				const roleID = (role.match(Regex.id) || [msg.guild.roles.find(_role => _role.name.toLowerCase() === role)!.id])[0];
				await msg.guild.updateConfig({ suggestion: { ...suggestion, role: roleID } });
				msg.sendEmbed({
					setDescription: `**${msg.author.tag}** I have updated the suggestions denial/approval role to <@&${roleID}> for this server.
						Members with the \`Manage Server\` or \`Administrator\` permission will also have access.`
				});
			};
		}
		const targetRoleorChannel = msg.args[1];
		if (targetRoleorChannel) {
			if (!validateFn(msg, targetRoleorChannel)) {
				return msg.response = await msg.sendEmbed({
					setDescription: `**${msg.author.tag}** ${invalidResponseMsg}`
				});
			}
			return update(targetRoleorChannel);
		}
		new Prompt({ msg, initialMsg, validateFn, invalidResponseMsg }).on('promptResponse', async ([arg]) => update(arg));
	}
}
