import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import { GuildChannel } from 'discord.js';
import Prompt from '../../structures/Prompt';
import HavocTextChannel from '../../extensions/TextChannel';
import Util from '../../util/Util';
import Regex from '../../util/Regex';
import Time from '../../util/Time';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ms = require('ms');

const getGiveawayChannel = async (msg: HavocMessage) => {
	const existing = msg.guild.channels.find((channel: GuildChannel) => channel.name === 'giveaways');
	const { giveaway } = await msg.guild.config;
	if (!giveaway) {
		if (!existing) {
			msg.response = await msg.sendEmbed({
				setDescription: `**${msg.author.tag}** I couldn't find a \`#giveaways\` and a giveaway channel hasn't been configured.
				${msg.member!.permissions.has('MANAGE_GUILD') ? 'U' : 'You will need to ask someone with the `Manage Guild` permission to u'}se \`${msg.prefix}giveaway config\` to set one up.`
			});
			return null;
		}
		return existing;
	}
	const { channel } = giveaway;
	const giveawayChannel = msg.guild.channels.get(channel);
	if (!giveawayChannel) {
		msg.response = await msg.sendEmbed({
			setDescription: `**${msg.author.tag}** the giveaway channel that was in the configuration doesn't exist.
			${msg.member!.permissions.has('MANAGE_GUILD') ? 'U' : 'You will need to ask someone with the `Manage Guild` permission to u'}se \`${msg.prefix}giveaway config\` to set one up.`
		});
		return null;
	}
	return giveawayChannel;
};

export default class Giveaway extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b1000,
			description: 'Creates a giveaway with options.',
			aliases: new Set(['g']),
			subCommands: new Set(['start', 'end', 'reroll', 'config']),
			target: 'string',
			prompt: {
				initialMsg: ['would you like to `start`, `end` or `reroll` a giveaway? (enter the according option)'],
				validateFn: (msg: HavocMessage, str: string) => msg.args.length || ['start', 'end', 'reroll'].includes(str),
				invalidResponseMsg: 'You will need to enter either `start`, `end` or `reroll`'
			},
			subArgs: [{
				subCommand: 'start',
				target: 'string',
				prompt: {
					initialMsg: [
						'enter the time limit for how long the giveaway should last suffix the time with `w`/`d`/`h`/`m`/`s`, e.g: `3m5s` would be 3 minutes and 5 seconds.',
						'enter the amount of possible winners for the giveaway.',
						'enter the prize that of the giveaway.'
					],
					validateFn: [
						(msg: HavocMessage, str: string) => Boolean(Time.parse(str)),
						(msg: HavocMessage, str: string) => !isNaN(Number(str))
					],
					invalidResponseMsg: [
						'You need to a enter a valid time format. `5h30m5s` would be 5 hours, 30 minutes and 5 seconds for example',
						'You need to a enter a valid number. `5` would allow the giveaway to have 5 winners for example'
					]
				}
			},
			{
				subCommand: 'end',
				target: 'string',
				prompt: {
					initialMsg: ["enter the ID of the giveaway that you would like to end right now which you can find on the footer of the giveaways's embed"],
					validateFn: (msg: HavocMessage, str: string) => Regex.id.test(str),
					invalidResponseMsg: 'You have entered an invalid ID.'
				}
			},
			{
				subCommand: 'reroll',
				target: 'string',
				prompt: {
					initialMsg: ["enter the ID of the giveaway that you would like to reroll which you can find on the footer of the giveaways's embed"],
					validateFn: (msg: HavocMessage, str: string) => Regex.id.test(str),
					invalidResponseMsg: 'You have entered an invalid ID.'
				}
			},
			{
				subCommand: 'config',
				target: 'string',
				prompt: {
					initialMsg: ['what would you like to configure from giveaways?\nEnter `channel` / `role`.'],
					validateFn: (msg: HavocMessage, str: string) => ['channel', 'role'].includes(str.toLowerCase()),
					invalidResponseMsg: 'You will need to enter either `channel` or `role`.'
				}
			}],
			userPerms: {
				role: async (msg: HavocMessage) => {
					const { giveaway } = await msg.guild.config;
					const { role }: { role: string } = giveaway || {};
					return role;
				},
				flags: ['MANAGE_GUILD']
			}
		});
	}

	public async run(this: HavocClient, { msg, targetObj: { target } }: { msg: HavocMessage; targetObj: { target: string } }) {
		const subArg = msg.command.subArgs!.find(c => c.subCommand === target || c.subCommand.includes(target))!;
		if (!subArg) {
			return msg.response = await msg.sendEmbed({
				setDescription: `**${msg.author.tag}** \`${msg.args[0]}\` is an invalid option. ${msg.command.prompt!.invalidResponseMsg}`
			});
		}
		const { prompt } = subArg;
		await new Promise(resolve => {
			new Prompt({
				msg,
				initialMsg: prompt!.initialMsg,
				validateFn: prompt!.validateFn,
				invalidResponseMsg: prompt!.invalidResponseMsg
			}).on('promptResponse', responses => {
				(msg.command as { [key: string]: any })[target].call(this, { msg, promptResponses: responses });
				resolve();
			});
		});
	}

	public async start(this: HavocClient, { msg, targetObj, promptResponses }: { msg: HavocMessage; targetObj: { target: string }; promptResponses: string[] }) {
		let time: string | number;
		let winners: string | number;
		let prize: string | string[];
		const giveawayChannel = await getGiveawayChannel(msg) as HavocTextChannel;
		if (!giveawayChannel) return;
		const invalidResponse = async (str: string) => msg.sendEmbed({ setDescription: str });
		if (promptResponses) {
			[time, winners, prize] = promptResponses;
		} else {
			[time, winners, ...prize] = targetObj.target.split(/ +/);
			prize = prize.join(' ');
			if (!Time.parse(time)) return msg.response = await invalidResponse(`**${msg.author.tag}** \`${time}\` is an invalid time format. ${msg.command.subArgs![0].prompt!.invalidResponseMsg![0]}`);
			if (isNaN(Number(winners))) return msg.response = await invalidResponse(`**${msg.author.tag}** \`${winners}\` is an invalid amount of winners. ${msg.command.subArgs![0].prompt!.invalidResponseMsg![1]}`);
			if (!prize) return msg.response = await invalidResponse(`**${msg.author.tag}** the prize must be specified`);
		}
		time = Time.parse(time);
		const embed = msg.constructEmbed({
			setTitle: prize,
			setDescription: `React with 🎉 to enter!\nTime remaining: **${ms(time, { 'long': true })}**`,
			setFooter: `${winners || 1} ${Util.plural('Winner', Number(winners) || 1)} | Ends at: `,
			setColor: 'GREEN'
		});
		if (time > 60000) embed.setTimestamp(Date.now() + time);
		// eslint-disable-next-line promise/catch-or-return
		giveawayChannel.send('🎉 **GIVEAWAY** 🎉', embed).then(async m => {
			if (m.deleted) return;
			await Promise.all([
				m.react('🎉'),
				m.edit(m.embeds[0].setFooter(`${winners || 1} ${Util.plural('Winner', Number(winners) || 1)} | Giveaway ID: ${m.id} | Ends at: `))
			]);
			if (time < 100) {
				setTimeout(async () => m.endGiveaway(Number(winners)), time as number);
			} else {
				await this.giveaways.add(Date.now() + (time as number), {
					channel: m.channel.id,
					message: m.id,
					winners: winners.toString()
				}, true);
			}
			msg.response = await msg.sendEmbed({
				setDescription: `**${msg.author.tag}** I have started the [giveaway](${m.url}).`
			});
		});
	}

	public async end(this: HavocClient, { msg, targetObj: { target } }: { msg: HavocMessage; targetObj: { target: string } }) {
		const giveaway = this.giveaways.find(g => g.message === target);
		if (!giveaway) {
			return msg.response = await msg.sendEmbed({
				setDescription: `**${msg.author.tag}** you have entered an invalid Giveaway ID.`,
				setImage: 'https://i.imgur.com/jZpv4Fk.png'
			});
		}
		await this.giveaways.remove(giveaway.endTime);
		msg.response = await msg.sendEmbed({
			setDescription: `**${msg.author.tag}** I have ended the [giveaway](https://discordapp.com/channels/${msg.guild.id}/${giveaway.channel}/${giveaway.message}).`
		});
	}


	public async reroll(this: HavocClient, { msg, targetObj: { target } }: { msg: HavocMessage; targetObj: { target: string } }) {
		const giveawayChannel = await getGiveawayChannel(msg) as HavocTextChannel;
		if (!giveawayChannel) return;
		const giveawayMsg = await giveawayChannel.messages.fetch(target).catch(() => null) as HavocMessage;
		if (!giveawayMsg) {
			return msg.response = await msg.sendEmbed({
				setDescription: `**${msg.author.tag}** you have entered an invalid Giveaway ID.`,
				setImage: 'https://i.imgur.com/jZpv4Fk.png'
			});
		}
		const reaction = giveawayMsg.reactions.get('🎉');
		if (!reaction) {
			return msg.response = await msg.sendEmbed({
				setDescription: `**${msg.author.tag}** a new winner could not be determined as there aren't any 🎉 reactions on the [giveaway](${giveawayMsg.url}).`
			});
		}
		const newWinner = (await reaction.users.fetch())
			.filter(user => user.id !== this.user!.id)
			.random();
		if (!newWinner) {
			return msg.response = await msg.sendEmbed({
				setDescription: `**${msg.author.tag}** a new winner could not be determined as there aren't enough 🎉 reactions on the [giveaway](${giveawayMsg.url}).`
			});
		}
		await giveawayMsg.sendEmbed({
			setDescription: `🎉 Congratulations **${newWinner.tag}**! You are the new winner of the [giveaway](${giveawayMsg.url}) for ${giveawayMsg.embeds[0].title} 🎉`,
			setColor: 'GOLD'
		}).then(async m => newWinner.send(m.embeds[0])).catch(() => null);
		return msg.response = await msg.sendEmbed({
			setDescription: `**${msg.author.tag}** a new winner has been rerolled on the [giveaway](${giveawayMsg.url}).`
		});
	}

	public async config(this: HavocClient, { msg, targetObj: { target } }: { msg: HavocMessage; targetObj: { target: string } }) {
		const { giveaway } = await msg.guild.config;
		let initialMsg: string[];
		let invalidResponseMsg: string;
		let validateFn: Function;
		let update: Function;
		if (target.split(' ')[0] === 'channel') {
			initialMsg = ['mention the channel, or enter the ID of the channel that would like the giveaways to be created on.'];
			// eslint-disable-next-line no-shadow
			validateFn = (msg: HavocMessage, str: string) => msg.mentions.channels.size || msg.guild.channels.has(str);
			invalidResponseMsg = `You will need to mention the channel (e.g: ${msg.channel}) or enter the channel's ID (e.g: ${msg.channel.id}).`;
			update = async (channel: string) => {
				await msg.guild.updateConfig({ giveaway: { ...giveaway, channel: channel.match(/\d+/)![0] } });
				msg.sendEmbed({
					setDescription: `**${msg.author.tag}** I have updated the giveaways channel to ${channel.startsWith('<') ? channel : `<#${channel}>`} for this server.`
				});
			};
		} else {
			const randomRole = msg.guild.roles.random()!;
			initialMsg = ['mention the role, or enter the name of the role that you would like to give access for starting/ending giveaways.'];
			// eslint-disable-next-line no-shadow
			validateFn = (msg: HavocMessage, str: string) => msg.mentions.roles.size || msg.guild.roles.some(role => role.name.toLowerCase() === str);
			invalidResponseMsg = `You will need to mention the role (e.g: ${randomRole}) or enter the role's name (e.g: ${randomRole.name}).`;
			update = async (role: string) => {
				const roleID = (role.match(Regex.id) || [msg.guild.roles.find(_role => _role.name.toLowerCase() === role)!.id])[0];
				await msg.guild.updateConfig({ giveaway: { ...giveaway, role: roleID } });
				msg.sendEmbed({
					setDescription: `**${msg.author.tag}** I have updated the giveaways role to <@&${roleID}> for this server.
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
