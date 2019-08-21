import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import { GuildChannel, SnowflakeUtil } from 'discord.js';
import HavocTextChannel from '../../extensions/TextChannel';
import Util from '../../util/Util';
import Responses from '../../util/Responses';

export async function getSuggestionChannel(msg: HavocMessage) {
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
}

export default class Suggestion extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b1000,
			description: 'Creates a suggestion that will either be approved or denied.',
			aliases: new Set(['s', 'suggest', 'suggestions']),
			args: [{
				key: 'suggestionOrSubCommand',
				type: 'string',
				prompt: { initialMsg: 'enter the suggestion that you would like to create or enter whether you will like to `approve`, `deny` or `config` the suggestion by entering the according option.' }
			}],
			usage: [
				'[approve] [suggestion ID] <reason>',
				'[deny] [suggestion ID] <reason>',
				`[config] [channel] [${Responses.usage('channel')}]`,
				`[config] [role] [${Responses.usage('role')}]`
			],
			examples: {
				'approve {id}': 'approves the suggestion with the corresponding ID',
				'approve {id} yes': 'approves the suggestion with the corresponding ID with the reason "yes"',
				'deny {id}': 'denies the suggestion with the corresponding ID',
				'deny {id} no': 'denies the suggestion with the corresponding ID with the reason "yes"',
				'config channel {channel}': 'changes the suggestion channel to the corresponding channel (future giveaways will take place in this channel)',
				'config role {role}': 'changes the suggestion role to the corresponding role (anyone with this role can approve/deny/config giveaways)'
			}
		});
	}

	public async run(this: HavocClient, { msg, target: { suggestionOrSubCommand } }: { msg: HavocMessage; target: { suggestionOrSubCommand: string } }) {
		const subCommands = ['approve', 'deny', 'config'];
		if (subCommands.includes(suggestionOrSubCommand.toLowerCase())) {
			msg.args = msg.args.filter(arg => !subCommands.includes(arg));
			return this.commands.handler.handle(msg, this.commands.get(`suggestion-${suggestionOrSubCommand}`)!);
		}
		const suggestionChannel = await getSuggestionChannel(msg) as HavocTextChannel;
		if (!suggestionChannel) return;
		await msg.delete();
		const suggestion = suggestionOrSubCommand.length > 1853 ? await Util.haste(suggestionOrSubCommand, 'txt') : suggestionOrSubCommand;
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
			msg.respond(`your suggestion has been submitted, click [here](${suggestionMessage.url}) to view it.
			I was unable to DM you so you will need to enable them if you will be notified about the status of approval/denial.`);
		});
	}
}
