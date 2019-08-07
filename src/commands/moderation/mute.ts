import { GuildMember } from 'discord.js';
import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import MuteSchedule from '../../schedules/Mute';
import HavocGuild from '../../extensions/Guild';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ms = require('ms');

export default class Mute extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b1000,
			description: 'Mutes (restricts from sending and reacting to messages) the inputted member from the server.',
			aliases: new Set(['m', 'shhh', 'stfu']),
			args: [{
				type: 'time',
				optional: true,
				prompt: {
					initialMsg: 'enter the duration how long the memebr should be muted for, suffix the time with `w`/`d`/`h`/`m`/`s`, e.g: `3m5s` would be 3 minutes and 5 seconds.',
					invalidResponseMsg: 'You need to a enter a valid time format. `5h30m5s` would be 5 hours, 30 minutes and 5 seconds for example'
				}
			},
			{
				type: 'member',
				prompt: { initialMsg: 'mention the user / enter the users\'s ID, tag, nickname or username who you would like to mute.' }
			},
			{
				key: 'reason',
				type: 'string',
				optional: true,
				prompt: {
					initialMsg: 'enter the reason for the mute.',
					invalidResponseMsg: 'You need to enter a reason for the mute or you can enter `None` if you would not like to provide a reason.'
				}
			}]
		});
	}

	public async getMuteRole(guild: HavocGuild) {
		let muteRole = guild.roles.find(r => r.name === 'HavocMute');
		if (muteRole) {
			const promises = guild.channels
				.filter(channel => channel.type === 'text')
				.map(async textchannel => {
					const currentMutePerms = textchannel.permissionOverwrites.get(muteRole!.id);
					if (!currentMutePerms || currentMutePerms.deny.bitfield !== 2112) {
						await textchannel.updateOverwrite(muteRole!.id, {
							SEND_MESSAGES: false,
							ADD_REACTIONS: false
						}).catch(() => null);
					}
				});
			await Promise.all(promises);
		}
		if (!muteRole) {
			muteRole = await guild.roles.create({
				data: {
					name: 'HavocMute',
					position: guild.me!.roles.highest.position - 1
				}
			});

			const promises = guild.channels
				.filter(channel => channel.type === 'text')
				.map(textchannel => {
					textchannel.updateOverwrite(muteRole!.id, {
						SEND_MESSAGES: false,
						ADD_REACTIONS: false
					}).catch(() => null);
				});
			await Promise.all(promises);
		}
		return muteRole;
	}

	public async run(this: HavocClient, { msg, target: { member, time, reason } }: { msg: HavocMessage; target: { member: GuildMember; time: number; reason: string } }) {
		// @ts-ignore
		const muteRole = await this.commands.handler.get('mute').getMuteRole(msg.guild);
		let response;
		if (member.id === this.user!.id) {
			await msg.react('😢');
			return msg.channel.send('😢');
		}
		let role = msg.guild.me!.roles.highest;
		if (role.comparePositionTo(muteRole) < 1) {
			response = `the \`HavocMute\` role has a higher position compared to my highest role \`${role.name}\`, therefore I do not have permission to mute msg user.`;
		}
		role = msg.member!.roles.highest;
		if (role.comparePositionTo(muteRole) < 1 && msg.author.id !== msg.guild.ownerID) {
			response = `the \`HavocMute\` role has a higher position compared to your highest role \`${role.name}\`, therefore you do not have permission to mute msg user.`;
		}
		if (response) {
			await msg.react('⛔');
			return msg.response = await msg.sendEmbed({ setDescription: `**${msg.author.tag}** ${response}` });
		}
		if (member.roles.has(muteRole.id)) return msg.sendEmbed({ setDescription: `**${msg.author.tag}** \`${member.user.tag}\` is already muted.` });
		await this.scheduler.add('mute',
			new MuteSchedule(this, time ? (Date.now() + (time as number)) : 0, {
				guild: msg.guild.id,
				member: member.id,
				length: time as number,
				muter: msg.author.id,
				reason
			}));
		await member.roles.add(muteRole, `Muted by ${msg.author.tag}${time ? ` for ${ms(time, { 'long': true })}` : ''}${reason ? ` due to the reason: ${reason}` : ''}`);
		msg.sendEmbed({ setDescription: `**${msg.author.tag}** I have muted \`${member.user.tag}\`${time ? ` for ${ms(time, { 'long': true })}` : ''}${reason ? ` due to the reason: \`${reason}\`` : ''} 🙊` });
	}
}
