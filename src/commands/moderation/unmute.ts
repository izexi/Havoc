import { GuildMember } from 'discord.js';
import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';

export default class Unmute extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b1000,
			description: 'Unmutes (no longer restricts from sending and reacting to messages) the inputted member from the server.',
			aliases: new Set(['um']),
			args: [{
				type: 'member',
				prompt: { initialMsg: 'mention the user / enter the users\'s ID, tag, nickname or username who you would like to unmute.' }
			},
			{
				key: 'reason',
				type: 'string',
				optional: true,
				prompt: {
					initialMsg: 'enter the reason for the unmute.',
					invalidResponseMsg: 'You need to enter a reason for the unmute or you can enter `None` if you would not like to provide a reason.'
				}
			}],
			examples: {
				'{member}': 'unmutes the mentioned member',
				'{user} accident': 'unmutes the mentioned member with the reason "accident"'
			}
		});
	}

	public async run(this: HavocClient, { msg, target: { member, reason } }: { msg: HavocMessage; target: { member: GuildMember; time: number; reason: string } }) {
		// @ts-ignore
		const muteRole = await this.commands.handler.get('mute').getMuteRole(msg.guild);
		let response;
		if (member.id === this.user!.id) {
			await msg.react('😢');
			return msg.channel.send('😢');
		}
		let role = msg.guild.me!.roles.highest;
		if (role.comparePositionTo(muteRole) < 1) {
			response = `the \`HavocMute\` role has a higher position compared to my highest role \`${role.name}\`, therefore I do not have permission to unmute msg user.`;
		}
		role = msg.member!.roles.highest;
		if (role.comparePositionTo(muteRole) < 1 && msg.author.id !== msg.guild.ownerID) {
			response = `the \`HavocMute\` role has a higher position compared to your highest role \`${role.name}\`, therefore you do not have permission to unmute msg user.`;
		}
		if (response) {
			await msg.react('⛔');
			return msg.response = await msg.sendEmbed({ setDescription: `**${msg.author.tag}** ${response}` });
		}
		if (!member.roles.has(muteRole.id)) return msg.sendEmbed({ setDescription: `**${msg.author.tag}** \`${member.user.tag}\` is not muted.` });
		const { endTime } = await this.db.fieldQuery('mute', false, ['guild', msg.guild.id], ['member', member.id])
			.catch(() => ({ endTime: null })) || { endTime: null };
		if (endTime) await this.scheduler.get(endTime)!.end();
		await member.roles.remove(muteRole, `Unmuted by ${msg.author.tag}${reason ? ` due to the reason: ${reason}` : ''}`);
		msg.sendEmbed({ setDescription: `**${msg.author.tag}** I have unmuted \`${member.user.tag}\`${reason ? ` due to the reason: \`${reason}\`` : ''}` });
	}
}
