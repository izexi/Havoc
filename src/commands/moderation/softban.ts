import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import HavocUser from '../../extensions/User';
import Prompt from '../../structures/Prompt';

export default class Softban extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b1000,
			description: 'Softbans (bans and then immediately unbans) the inputted user from the server.',
			flags: new Set(['force', 'f']),
			args: [{
				type: 'user',
				prompt: { initialMsg: 'mention the user / enter the users\'s ID, tag, nickname or username who you would like to softban.' }
			},
			{
				optional: true,
				key: 'reason',
				type: 'string',
				prompt: {
					initialMsg: 'enter the reason for the softban.',
					invalidResponseMsg: 'You need to enter a reason for the softban or you can enter `None` if you would not like to provide a reason.'
				}
			}],
			userPerms: { flags: 'BAN_MEMBERS' },
			examples: {
				'{member}': 'softbans the mentioned member',
				'{user} spam': 'softbans the mentioned member with the reason "spam"'
			}
		});
	}

	public async run(this: HavocClient, { msg, target: { user, loose, reason }, flag }: { msg: HavocMessage; target: { user: HavocUser; loose?: string; reason: string | null }; flag: string }) {
		reason = reason && reason.toLowerCase() === 'none' ? null : reason;
		let response;
		const tag = loose ? user.tag.replace(new RegExp(loose, 'gi'), '**$&**') : user.tag;
		if (user.id === msg.author.id) {
			await msg.react('463993771961483264');
			return msg.channel.send('<:WaitWhat:463993771961483264>');
		}
		if (user.id === this.user!.id) {
			await msg.react('😢');
			return msg.channel.send('😢');
		}
		if (user.id === msg.guild.ownerID) {
			response = `${tag} is the owner of this server, therefore I do not have permission to softban this user.`;
		}
		const member = await msg.guild.members.fetch(user).catch(() => null);
		if (member) {
			const role = member.roles.highest;
			if (msg.guild.me!.roles.highest.comparePositionTo(role) < 1) {
				response = `${tag} has the role \`${role.name}\` which has a higher / equivalent position compared to my highest role \`${msg.guild.me!.roles.highest.name}\`, therefore I do not have permission to softban this user.`;
			}
			if (msg.member!.roles.highest.comparePositionTo(role) < 1 && msg.author.id !== msg.guild.ownerID) {
				response = `${tag} has the role \`${role.name}\` which has a higher / equivalent position compared to your highest role \`${msg.member!.roles.highest.name}\`, therefore you do not have permission to softban this user.`;
			}
		}
		if (response) {
			await msg.react('⛔');
			return msg.respond(response);
		}
		// @ts-ignore
		// eslint-disable-next-line newline-per-chained-call
		const existing = await this.api.guilds(msg.guild.id).bans(user.id).get().catch(() => null);
		if (existing) {
			return msg.respond(`${tag} is already banned in this server.`);
		}
		const unban = async () => {
			await msg.guild.members.ban(user, { reason: `Softbanned by ${msg.author.tag}${reason ? ` for the reason ${reason}` : ''}` });
			await msg.guild.members.unban(user, `Softbanned by ${msg.author.tag}${reason ? ` for the reason ${reason}` : ''}`);
			msg.respond(`I have softbanned \`${user.tag}\` from \`${msg.guild.name}\`${reason ? ` for the reason ${reason}` : '.'} 🔨`);
			msg.guild.modlog(msg, user, reason);
		};
		if (flag) return unban();
		await msg.react('464034357955395585');
		new Prompt({
			msg,
			initialMsg: `**${msg.author.tag}** are you sure you want to softban \`${user.tag}\` from \`${msg.guild.name}\`?  Enter __y__es or __n__o`,
			invalidResponseMsg: 'Enter __y__es or __n__o',
			target: (_msg: HavocMessage) => _msg.arg.match(/^(yes|y|n|no)$/i)
		}).on('promptResponse', async ([responses]) => {
			if ((await responses).target[0][0] === 'y') {
				unban();
			} else {
				msg.respond(`the \`softban\` command has been cancelled.`);
			}
		});
	}
}
