import HavocMessage from '../extensions/Message';
import HavocClient from '../client/Havoc';
import Targetter, { Target } from '../util/Targetter';
import Prompt from '../structures/Prompt';
import Logger from '../util/Logger';
import Util from '../util/Util';

export default async function(this: HavocClient, msg: HavocMessage) {
	if (msg.author!.bot || msg.webhookID || !msg.prefix || !msg.content.startsWith(msg.prefix)) return;
	const command = this.commands.handler.get(msg.args.shift()!);
	if (!command) return;
	if (command.category === 'dev' && msg.author.id !== this.havoc) return;
	try {
		let method = 'run';
		const params: CommandParams = { msg };
		const fillPomptResponses = async (initialMsg: string[], validateFn?: Function | Function[], invalidResponseMsg?: string | string[]) =>
			new Promise(resolve => {
				new Prompt({ msg, initialMsg, validateFn, invalidResponseMsg })
					.on('promptResponse', responses => {
						params.promptResponses = responses;
						resolve();
					});
			});
		const filltargetObj = async (str: string) => {
			params.targetObj = await Targetter.getTarget({
				str: str,
				guild: msg.guild,
				type: command.target!
			});
		};
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
				msg.text = msg.args.join(' ');
			}
		}
		if (command.subCommands.size) {
			if (msg.args.length) {
				const possibleSubCommand = msg.args[0].toLowerCase();
				if (command.subCommands && command.subCommands.has(possibleSubCommand)) {
					method = possibleSubCommand;
					msg.args.splice(msg.args.findIndex(arg => command.subCommands.has(arg)), 1);
					msg.text = msg.args.join(' ');
				}
			}
		}
		if (command.target) await filltargetObj(msg.args.join(' '));
		if (command.opts & (1 << 3)) {
			if (!msg.args.length) {
				if (command.subArgs && command.opts & (1 << 3) && method !== 'run') {
					const { prompt } = command.subArgs.find(c => c.subCommand === method || c.subCommand.includes(method))!;
					await fillPomptResponses(prompt!.initialMsg, prompt!.validateFn, prompt!.invalidResponseMsg);
				} else {
					await fillPomptResponses(command.prompt!.initialMsg, command.prompt!.validateFn, command.prompt!.invalidResponseMsg);
				}
				if (command.target) await filltargetObj(params.promptResponses![0]);
			} else if (command.prompt && command.prompt.validateFn) {
				if (!(command.prompt.validateFn as { [key: number]: Function }[0])(msg, msg.text)) {
					return msg.response = await msg.sendEmbed({
						setDescription: `**${msg.author.tag}** \`${msg.text}\` is an invalid option!\n${command.prompt.invalidResponseMsg}.`
					});
				}
			}
		}
		(command as { [key: string]: any })[method].call(this, params);
	} catch (err) {
		Logger.error(`Error while executing command ${command.name}`, err);
		this.emit('commandError', err, msg);
	}
}

interface CommandParams {
	msg: HavocMessage;
	targetObj?: Target | null;
	text?: string;
	promptResponses?: string[];
	flag?: string;
}
