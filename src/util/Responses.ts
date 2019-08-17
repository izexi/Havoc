import HavocMessage from '../extensions/Message';
import HavocTextChannel from '../extensions/TextChannel';

// eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
export default {
	// eslint-disable-next-line @typescript-eslint/promise-function-async
	random: (msg: HavocMessage, option: string) => {
		switch (option) {
			case 'user':
				return msg.author;
			case 'member':
				return msg.member!.displayName;
			case 'role':
				return msg.guild.roles.random()!;
			case 'channel':
				return msg.guild.channels.filter(channel => channel.type === 'text').random()!;
			case 'emoji':
				return msg.guild.emojis.random()!;
			case 'prefix':
				return msg.prefix;
			case 'id':
				return msg.id;
			default:
				return '';
		}
	},
	usage: (option: string) => {
		switch (option) {
			case 'user':
				return 'user mention | user tag | username | user id';
			case 'member':
				return 'member mention | member tag | member nickname | member id';
			case 'role':
				return 'role mention | role name | role id';
			case 'channel':
				return 'channel mention | channel name | channel id';
			case 'emoji':
				return 'emoji | emoji name | emoji id';
			case 'command':
				return 'command name';
			case 'reason':
				return 'reason';
			case 'time':
				return 'time';
		}
	},
	user: (msg: HavocMessage) => `You need to mention a user (e.g: ${msg.author}) or enter the users\'s ID (e.g: \`${msg.author.id}\`) or tag (e.g: \`${msg.author.tag}\`)${msg.member!.nickname ? ` or nickname (e.g: \`${msg.member!.displayName})\`` : ''} or username (e.g: \`${msg.author.username}\`).`,
	member: (msg: HavocMessage) => `You need to mention a member (e.g: ${msg.member}) or enter the member\'s ID (e.g: \`${msg.author.id}\`) or tag (e.g: \`${msg.author.tag}\`)${msg.member!.nickname ? ` or nickname (e.g: \`${msg.member!.displayName})\`` : ''} or username (e.g: \`${msg.author.username}\`).`,
	role: (msg: HavocMessage) => {
		const role = msg.member!.roles.random()!;
		return `You need to mention the role (e.g: ${role}) or enter the role's name (e.g: \`${role.name}\`).`;
	},
	channel: (msg: HavocMessage) => `You need to mention the channel (e.g: ${msg.channel}), enter the channel's name (e.g: \`${(msg.channel as HavocTextChannel).name}\`) or enter the channel's ID (e.g: \`${msg.channel.id}\`).`,
	emoji: (msg: HavocMessage) => {
		const emoji = msg.guild!.emojis.random()!;
		return `You need to enter a the emoji itself (e.g: ${emoji}) or the id (e.g \`${emoji.id}\`).`;
	}
} as { [key: string]: Function };
