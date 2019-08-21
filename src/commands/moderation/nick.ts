import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import { GuildMember } from 'discord.js';

export default class Kick extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b1000,
			description: 'Changes the nickname of inputted member to the inputted new nickname.',
			args: [{
				type: 'member',
				prompt: { initialMsg: 'mention the user / enter the users\'s ID, tag, nickname or username who\'s nickname you would like to change.' }
			},
			{
				key: 'nick',
				type: 'string',
				prompt: { initialMsg: 'enter the nickname.' }
			}],
			userPerms: { flags: 'MANAGE_NICKNAMES' },
			usage: ['[{member}] [nickname]'],
			examples: { '{member} havoc': 'changes the nickname of the corresponding member to "havoc"' }
		});
	}

	public async run(this: HavocClient, { msg, target: { member, nick } }: { msg: HavocMessage; target: { member: GuildMember; nick: string } }) {
		let response;
		if (member.id === msg.guild.ownerID) {
			response = `${member.user.tag} is the owner of this server, therefore I do not have permission to change this member's nickname.`;
		}
		const role = member.roles.highest;
		if (msg.guild.me!.roles.highest.comparePositionTo(role) < 1) {
			response = `${member.user.tag} has the role \`${role.name}\` which has a higher / equivalent position compared to my highest role \`${msg.guild.me!.roles.highest.name}\`, therefore I do not have permission to this member's nickname.`;
		}
		if (msg.member!.roles.highest.comparePositionTo(role) < 1 && msg.author.id !== msg.guild.ownerID) {
			response = `${member.user.tag} has the role \`${role.name}\` which has a higher / equivalent position compared to your highest role \`${msg.member!.roles.highest.name}\`, therefore you do not have permission to this member's nickname.`;
		}
		if (response) {
			await msg.react('⛔');
			return msg.respond(response);
		}
		const oldNick = member.displayName;
		const newNick = nick.slice(0, 32);
		await member.setNickname(newNick);
		msg.respond(`I have changed \`${member.user.tag}\`'s nickname from \`${oldNick}\` to \`${newNick}\``);
	}
}
