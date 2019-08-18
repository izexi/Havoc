import HavocMessage from '../extensions/Message';
import HavocClient from '../client/Havoc';
import Targetter from '../util/Targetter';
import Logger from '../util/Logger';
import Responses from '../util/Responses';
import Command, { CommandParams } from '../structures/bases/Command';
import HavocTextChannel from '../extensions/TextChannel';
import Util from '../util/Util';
import { MessageEmbed, PermissionString } from 'discord.js';

const rejectionHandler = (client: HavocClient, msg: HavocMessage, rej: Error) => {
	(client.channels.get('612603429591973928') as HavocTextChannel).send(
		new MessageEmbed()
			.setDescription(`
				**Server:** ${msg.guild ? msg.guild.name : 'DM'} ${msg.guild ? `(${msg.guild.id})` : ''}
				**Unhandled Rejection:** ${rej.stack || rej}
				**User:** ${msg.author.tag} (${msg.author.id})
				**Command:** ${msg.command.name}
				**Message Content:**
				${Util.codeblock(msg.content)}
				${msg.validArgs.size ? `**Valid Args:**\n${Util.codeblock([...msg.validArgs].join('\n'))}` : ''}
				${msg.promptResponses.size ? `**Prompt Responses:**\n${Util.codeblock([...msg.promptResponses].join('\n'))}` : ''}
			`)
			.setColor('ORANGE')
			.setAuthor(`⚠${rej}⚠`, msg.guild ? msg.guild.iconURL() : '')
			.setTimestamp()
			.setFooter('', msg.author.pfp)
	);
};

export async function handleMessage(client: HavocClient, msg: HavocMessage, command: Command) {
	const params: CommandParams = { msg, target: {} };
	msg.command = command;
	if (command.userPerms) {
		let permRole;
		let { role, flags } = command.userPerms;
		if (role) permRole = await role(msg);
		if (!(role && msg.member!.roles.has(permRole)) && !(flags && msg.member!.hasPermission(flags))) {
			if (flags) flags = Array.isArray(flags) ? flags : [flags] as PermissionString[];
			await msg.react('⛔');
			return msg.response = await msg.sendEmbed({
				setDescription: `**${msg.author.tag}** you do not have sufficient permisions to use this command${permRole ? ` you need to have the \`${permRole.name}\` role or ` : ''}${flags ? ` you need to have the ${(flags as string[]).map(flag => `\`${Util.normalizePermFlag(flag)}\``).join(', ')} ${Util.plural('permission', (flags as string[]).length)}` : ''} in order to use this command.`
			});
		}
		if (flags && !msg.guild.me!.hasPermission(flags)) {
			flags = Array.isArray(flags) ? flags : [flags] as PermissionString[];
			return msg.response = await msg.sendEmbed({
				setDescription: `**${msg.author.tag}** I do not have sufficient permisions to use this command I need to have the ${(flags as string[]).map(flag => `\`${Util.normalizePermFlag(flag)}\``).join(', ')} ${Util.plural('permission', (flags as string[]).length)} in order to use this command.`
			});
		}
	}
	if (command.category === 'donators') {
		if (command.name === 'emojify') {
			if (!client.donators.get('10')!.has(msg.author.id)) {
				return msg.sendEmbed({ setDescription: `**${msg.author.tag}** only donators can use this command, do \`${msg.prefix}donate\` for more info` });
			}
		} else if (!client.donators.get('5')!.has(msg.author.id)) {
			return msg.sendEmbed({ setDescription: `**${msg.author.tag}** only donators can use this command, do \`${msg.prefix}donate\` for more info` });
		}
	}
	if (command.flags.size) {
		let flagIndex!: number;
		const flag = msg.args.find((arg, i) => {
			// TODO: make flags look nicer
			if (arg.startsWith(msg.prefix) && (command.flags.has(arg.slice(msg.prefix.length)) || (arg.includes('=') && [...command.flags].some(f => arg.slice(msg.prefix.length).startsWith(f))))) {
				flagIndex = i;
				return true;
			}
			return false;
		});
		if (flag) {
			params.flag = flag.slice(msg.prefix.length);
			msg.args.splice(flagIndex, 1);
		}
	}
	if (command.args) {
		if (!msg.args.length && command.argsRequired) {
			await msg.createPrompt({
				msg,
				initialMsg: command.args!.map(({ prompt }) => prompt!.initialMsg) as string[],
				invalidResponseMsg: command.args!.map(({ prompt }) => prompt!.invalidResponseMsg),
				target: command.args!.map(({ type }) => type)
			}).then(async responses => {
				const responseArr = await Promise.all(responses as Promise<{ target: string; loose: string | null }>[]);
				if (responseArr) {
					responseArr.forEach(({ target, loose }, i) =>
						Targetter.assignTarget(msg, command.args![i].type, target, loose, params.target!, command.args![i].key));
				}
			}).catch(err => Logger.error('Error when assigning targets from prompt', err));
		} else {
			params.target = await Targetter.parseTarget(msg);
			const invalidResponses = Object.entries(params.target).reduce((responses: string[], [key, target]) => {
				const arg = command.args!.find(a => a.key === key || a.type === key)!;
				// eslint-disable-next-line no-eq-null
				return key !== 'loose' && command.argsRequired && target == null && !arg.optional
					? [...responses, arg.prompt!.invalidResponseMsg! || Responses[key](msg)]
					: responses;
			}, []);
			const optionalEntry = Object.entries(params.target).find(([, v]) => v === 'optional');
			if (optionalEntry) params.target[optionalEntry[0]] = false;
			if (invalidResponses.length) {
				return msg.sendEmbed({
					setDescription: `**${msg.author.tag}** you have entered an invalid arguement. ${invalidResponses.join('\n')}`
				});
			}
		}
	}
	command.run.call(client, params).catch(rej => rejectionHandler(client, msg, rej));
}

export default async function(this: HavocClient, msg: HavocMessage) {
	if (msg.author!.bot || msg.webhookID || !msg.prefix || !msg.content.startsWith(msg.prefix) || (msg.channel.type === 'text' && (msg.channel as HavocTextChannel).prompts.has(msg.author.id))) return;
	const possibleTag = msg.guild.tags.get(msg.content.substring(msg.prefix.length));
	if (possibleTag) return msg.channel.send(possibleTag);
	const command = this.commands.handler.get(msg.args.shift()!.substring(msg.prefix.length));
	if (!command || this.commands.disabled.has(command.name) || (command.category === 'dev' && msg.author.id !== this.havoc)) return;
	try {
		handleMessage(this, msg, command).catch(rej => rejectionHandler(this, msg, rej));
		Logger.command(`${msg.author.tag} (${msg.author.id}) used command ${msg.prefix}${msg.command.name} in ${msg.guild ? msg.guild.name : 'DM'} ${msg.guild ? `(${msg.guild.id})` : ''} ${msg.channel instanceof HavocTextChannel ? `on #${msg.channel.name} (${msg.guild.id})` : ''}`);
	} catch (err) {
		Logger.error(`Error while executing command ${command.name}`, err);
		const id = Math.random()
			.toString(36)
			.substr(2, 9)
			.toUpperCase();
		msg.react('❗');
		(this.channels.get('406882982905774080') as HavocTextChannel).send(
			new MessageEmbed()
				.setDescription(`
					**Server:** ${msg.guild ? msg.guild.name : 'DM'} ${msg.guild ? `(${msg.guild.id})` : ''}
					**Error:** ${err.stack}
					**User:** ${msg.author.tag} (${msg.author.id})
					**Command:** ${msg.command.name}
					**Message Content:**
					${Util.codeblock(msg.content)}
					**Error ID:** ${id}
				`)
				.setColor('RED')
				.setAuthor(`❗${err}❗`, msg.guild ? msg.guild.iconURL() : '')
				.setTimestamp()
				.setFooter('', msg.author.pfp)
		);
		msg.channel.send(
			new MessageEmbed()
				.setColor('RED')
				.setDescription(`
					**❗I have encountered an error trying to execute the \`${msg.command.name}\` command❗**
					Check \`${msg.prefix}help ${msg.command.name}\` to check how to properly use the command
					However, if you have used the command correctly please join **https://discord.gg/3Fewsxq** and report your issue in the ${this.supportServer.members.has(msg.author.id) ? '<#406873476591517706>' : '#bugs-issues'} channel.
				`)
				.setFooter(`Error ID: ${id}`, msg.author.displayAvatarURL())
		);
	}
}
