import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import { GuildMember, Role } from 'discord.js';
import MuteSchedule from '../../schedules/Mute';
import Util from '../../util/Util';

export default class Warn extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b1000,
			description: 'Warns the inputted members and takes action according to the set punishments.',
			aliases: new Set(['w']),
			args: [{
				type: 'member',
				prompt: { initialMsg: 'mention the user / enter the users\'s ID, tag, nickname or username who you would like to warn.' }
			},
			{
				optional: true,
				key: 'reason',
				type: 'string',
				prompt: {
					initialMsg: 'enter the reason for the warn.',
					invalidResponseMsg: 'You need to enter a reason for the warn or you can enter `None` if you would not like to provide a reason.'
				}
			}],
			userPerms: { flags: ['MANAGE_ROLES', 'KICK_MEMBERS', 'BAN_MEMBERS'] },
			examples: {
				'{member}': 'warns the mentioned member',
				'{user} toxic': 'warns the mentioned member with the reason "toxic"'
			}
		});
	}

	public async run(this: HavocClient, { msg, target: { member, loose, reason } }: { msg: HavocMessage; target: { member: GuildMember; loose?: string; reason: string | null } }) {
		reason = reason && reason.toLowerCase() === 'none' ? null : reason;
		let response;
		const tag = loose ? member.user.tag.replace(new RegExp(loose, 'gi'), '**$&**') : member.user.tag;
		if (member.id === msg.author.id) {
			await msg.react('463993771961483264');
			return msg.channel.send('<:WaitWhat:463993771961483264>');
		}
		if (member.id === this.user!.id) {
			await msg.react('😢');
			return msg.channel.send('😢');
		}
		if (member.id === msg.guild.ownerID) {
			response = `${tag} is the owner of this server, therefore I do not have permission to warn this user.`;
		}
		const role = member.roles.highest;
		if (msg.guild.me!.roles.highest.comparePositionTo(role) < 1) {
			response = `${tag} has the role \`${role.name}\` which has a higher / equivalent position compared to my highest role \`${msg.guild.me!.roles.highest.name}\`, therefore I do not have permission to warn this user.`;
		}
		if (msg.member!.roles.highest.comparePositionTo(role) < 1 && msg.author.id !== msg.guild.ownerID) {
			response = `${tag} has the role \`${role.name}\` which has a higher / equivalent position compared to your highest role \`${msg.member!.roles.highest.name}\`, therefore you do not have permission to warn this user.`;
		}
		if (response) {
			await msg.react('⛔');
			return msg.respond(response);
		}
		let { punishments } = await msg.guild.config;
		if (!punishments) {
			punishments = {
				3: 'mute 30',
				5: 'kick',
				10: 'ban'
			};
		}
		const key = member.id + msg.guild.id;
		this.db.category = 'warn';
		const query = await this.db.get(key) || [];
		const amount = query.length as number + 1;
		const punishment = punishments[amount] || '';
		const warnReason = reason;
		this.db.set(key, [...query, {
			reason,
			warner: msg.author.id
		}]);
		reason = `Punishment for reaching ${amount} warns (last warned by ${msg.author.tag}${reason ? ` due to the reason: \`${reason}\`` : ''}).`;
		switch (punishment.split(' ')[0]) {
			case 'mute':
				/* eslint-disable no-case-declarations */
				// @ts-ignore
				const muteRole = await this.commands.handler.get('mute').getMuteRole(msg.guild);
				const time = Number(punishment.split(' ')[1]);
				await this.scheduler.add('mute',
					new MuteSchedule(this, Date.now() + (time as number * 60000), {
						guild: msg.guild.id,
						member: member.id,
						length: time as number,
						muter: msg.author.id,
						reason
					}));
				await member.roles.add(muteRole as Role, Util.auditClean(reason));
				return msg.respond(`**${msg.author.tag}** I have warned \`${member.user.tag}\`${warnReason ? ` for the reason \`${warnReason}\`` : ''} and muted them for ${time} minutes as punishment for reaching ${amount} warns.`);
			case 'kick':
				await member.kick(Util.auditClean(reason));
				return msg.respond(`I have warned \`${member.user.tag}\`${warnReason ? ` for the reason \`${warnReason}\`` : ''} and kicked them as punishment for reaching ${amount} warns.`);
			case 'ban':
				await member.ban({ reason: Util.auditClean(reason) });
				return msg.respond(`I have warned \`${member.user.tag}\`${warnReason ? ` for the reason \`${warnReason}\`` : ''} and banned them as punishment for reaching ${amount} warns.`);
			default:
				msg.respond(`I have warned \`${member.user.tag}\`${warnReason ? ` for the reason \`${warnReason}\`` : ''}, this is their ${Util.ordinal(amount)} warning.`);
		}
	}
}
