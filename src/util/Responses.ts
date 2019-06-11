import HavocMessage from '../extensions/Message';
import HavocTextChannel from '../extensions/TextChannel';

// eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
export default {
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
