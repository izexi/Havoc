import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import * as moment from 'moment';

export default class ServerInfo extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b0011,
			description: 'View info about the server.',
			aliases: new Set(['sinfo', 'server'])
		});
	}

	public async run(this: HavocClient, { msg }: { msg: HavocMessage }) {
		const guild = msg.guild;
		msg.response = await msg.sendEmbed({
			setThumbnail: guild.iconURL() ||
                `https://placeholdit.imgix.net/~text?txtsize=50&txtfont=Whitney&w=128&h=128&bg=2f3136&txtclr=fff&txt=${guild.name.split(' ').map(name => name[0]).join('')}`,
			addField: [
				['❯Name', guild.name, true],
				['❯Owner', (await this.users.fetch(guild.ownerID)).tag, true],
				['❯Members', guild.memberCount, true],
				['Roles', `${guild.roles.size} (You can view a list of all roles by doing \`${msg.prefix}rolelist\`)`, true],
				['Emojis', `${guild.emojis.size} (You can view a list of all emojis by doing \`${msg.prefix}emojilist\`)`, true],
				['Categories', guild.channels.filter(channel => channel.type === 'category').size, true],
				['Text channels', guild.channels.filter(channel => channel.type === 'text').size, true],
				['Voice channels', guild.channels.filter(channel => channel.type === 'voice').size, true],
				['Created at', moment(guild.createdAt).format('LLLL'), true],
				['Region', guild.region, true]
			]
		});
	}
}
