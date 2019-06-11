import HavocMessage from '../extensions/Message';
import HavocClient from '../client/Havoc';
import Targetter from '../util/Targetter';
import Logger from '../util/Logger';
import Responses from '../util/Responses';
import Command, { CommandParams } from '../structures/bases/Command';
import HavocTextChannel from '../extensions/TextChannel';
import Util from '../util/Util';

export async function handleMessage(client: HavocClient, msg: HavocMessage, command: Command) {
	const params: CommandParams = { msg, target: {} };
	msg.command = command;
	if (command.userPerms) {
		let permRole;
		const { role, flags } = command.userPerms;
		if (role) permRole = await role(msg);
		if (!(role && msg.member!.roles.has(permRole)) && !(flags && msg.member!.hasPermission(flags))) {
			return msg.response = await msg.sendEmbed({
				setDescription: `**${msg.author.tag}** you do not have sufficient permisions to use this command${permRole ? ` you need to have the \`${permRole.name}\` role or ` : ''} you need to have the ${(flags as string[]).map(flag => `\`${Util.normalizePermFlag(flag)}\``).join(', ')}`
			});
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
		if (!msg.args.length && command.opts & (1 << 3)) {
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
			const invalidResponses = Object.entries(params.target).reduce((responses: string[], [key, target]) =>
				target || key === 'loose'
					? responses
					: [...responses, command.args!.find(arg => arg.key === key || arg.type === key)!.prompt!.invalidResponseMsg! || Responses[key](msg)], []);
			if (invalidResponses.length) {
				return msg.sendEmbed({
					setDescription: `**${msg.author.tag}** ${invalidResponses.join('\n')}`
				});
			}
		}
	}
	command.run.call(client, params);
}

export default async function(this: HavocClient, msg: HavocMessage) {
	if (msg.author!.bot || msg.webhookID || !msg.prefix || !msg.content.startsWith(msg.prefix) || (msg.channel.type === 'text' && (msg.channel as HavocTextChannel).prompts.has(msg.author.id))) return;
	const command = this.commands.handler.get(msg.args.shift()!.substring(msg.prefix.length));
	if (!command || this.commands.disabled.has(command.name) || (command.category === 'dev' && msg.author.id !== this.havoc)) return;
	try {
		handleMessage(this, msg, command);
	} catch (err) {
		Logger.error(`Error while executing command ${command.name}`, err);
		this.emit('commandError', err, msg);
	}
}
