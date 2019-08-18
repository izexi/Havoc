import Handler from '../structures/bases/Handler';
import CommandStore from '../stores/CommandStore';
import { Client, PermissionString } from 'discord.js';
import Command, { CommandParams } from '../structures/bases/Command';
import HavocMessage from '../extensions/Message';
import Targetter from '../util/Targetter';
import Logger from '../util/Logger';
import Responses from '../util/Responses';
import { rejectionHandler } from '../events/message';
import Util from '../util/Util';

export default class CommandHandler extends Handler<string, Command> {
	private _client: any;

	private _commands: CommandStore;

	public constructor(client: Client, events: CommandStore) {
		super();
		this._client = client;
		this._commands = events;
	}

	public async handle(msg: HavocMessage, command: Command) {
		const params: CommandParams = { msg, target: {} };
		msg.command = command;
		if (command.userPerms) {
			let permRole;
			let { role, flags } = command.userPerms;
			if (role) permRole = msg.guild.roles.get(await role(msg));
			if (!(permRole && msg.member!.roles.has(permRole.id)) && !(flags && msg.member!.hasPermission(flags))) {
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
				if (!this._client.donators.get('10')!.has(msg.author.id)) {
					return msg.sendEmbed({ setDescription: `**${msg.author.tag}** only donators can use this command, do \`${msg.prefix}donate\` for more info` });
				}
			} else if (!this._client.donators.get('5')!.has(msg.author.id)) {
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
		command.run.call(this._client, params).catch(rej => rejectionHandler(this._client, msg, rej));
	}

	public add(name: string, command: Command) {
		this._commands.set(name.replace('_', ''), command);
	}

	public reload(name: string | Command) {
		let command = name instanceof Command ? name : this.get(name);
		if (command) {
			const path = `../commands/${command.category}/${command.name}`;
			delete require.cache[require.resolve(path)];
			command = new (require(path).default)();
			this.add(command!.name, command!);
		}
	}

	public has(name: string) {
		if (!name) return false;
		name = name.toLowerCase();
		return this._commands.has(name) ||
			this._commands.some((c: Command) => c.aliases && c.aliases.has(name));
	}

	public get(name: string): Command | undefined {
		if (!name) return undefined;
		name = name.toLowerCase();
		return this._commands.get(name) ||
			this._commands.find((c: Command) => c.aliases && c.aliases.has(name));
	}

	public remove(event: string) {
		this._client.removeAllListeners(event);
	}
}
