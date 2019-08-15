import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import Prompt from '../../structures/Prompt';
import { GuildMember } from 'discord.js';

export default class Kick extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b1000,
			description: 'Kicks the inputted user from the server.',
			flags: new Set(['force', 'f']),
			args: [{
				type: 'member',
				prompt: { initialMsg: 'mention the user / enter the users\'s ID, tag, nickname or username who you would like to kick.' }
			},
			{
				optional: true,
				key: 'reason',
				type: 'string',
				prompt: {
					initialMsg: 'enter the reason for the kick.',
					invalidResponseMsg: 'You need to enter a reason for the kick or you can enter `None` if you would not like to provide a reason.'
				}
			}],
			userPerms: { flags: 'KICK_MEMBERS' }
		});
	}

	public async run(this: HavocClient, { msg, target: { member, loose, reason }, flag }: { msg: HavocMessage; target: { member: GuildMember; loose?: string; reason: string | null }; flag: string }) {
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
			response = `${tag} is the owner of this server, therefore I do not have permission to kick this user.`;
		}
		const role = member.roles.highest;
		if (msg.guild.me!.roles.highest.comparePositionTo(role) < 1) {
			response = `${tag} has the role \`${role.name}\` which has a higher / equivalent position compared to my highest role \`${msg.guild.me!.roles.highest.name}\`, therefore I do not have permission to kick this user.`;
		}
		if (msg.member!.roles.highest.comparePositionTo(role) < 1 && msg.author.id !== msg.guild.ownerID) {
			response = `${tag} has the role \`${role.name}\` which has a higher / equivalent position compared to your highest role \`${msg.member!.roles.highest.name}\`, therefore you do not have permission to kick this user.`;
		}
		if (response) {
			await msg.react('⛔');
			return msg.response = await msg.sendEmbed({ setDescription: `**${msg.author.tag}** ${response}` });
		}
		const kick = async () => {
			await member.kick(`Kicked by ${msg.author.tag}${reason ? ` for the reason ${reason}` : ''}`);
			msg.sendEmbed({ setDescription: `**${msg.author.tag}** I have kicked \`${member.user.tag}\` from \`${msg.guild.name}\`${reason ? ` for the reason ${reason}` : '.'} 🔨` });
			msg.guild.modlog(msg, member, reason);
		};
		if (flag) return kick();
		await msg.react('464034357955395585');
		new Prompt({
			msg,
			initialMsg: `**${msg.author.tag}** are you sure you want to kick \`${member.user.tag}\` from \`${msg.guild.name}\`?  Enter __y__es or __n__o`,
			invalidResponseMsg: 'Enter __y__es or __n__o',
			target: (_msg: HavocMessage) => _msg.arg.match(/^(yes|y|n|no)$/i)
		}).on('promptResponse', async ([responses]) => {
			if ((await responses).target[0][0] === 'y') {
				kick();
			} else {
				msg.response = await msg.sendEmbed({ setDescription: `**${msg.author.tag}** the \`kick\` command has been cancelled.` });
			}
		});
	}
}
