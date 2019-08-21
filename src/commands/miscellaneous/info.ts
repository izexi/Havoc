import { TextChannel, DMChannel, version } from 'discord.js';
import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import os = require('os');
import * as prettyMs from 'pretty-ms';

export default class Info extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b0011,
			description: 'Info about me.',
			aliases: new Set(['i', 'stats'])
		});
	}

	public async run(this: HavocClient, { msg }: { msg: HavocMessage }) {
		const getVoteLink = async () => this.supportServer!.members.fetch(msg.author)
			.then(() => 'https://discordapp.com/channels/406873117215031297/406873578458447873/535928285402628106')
			.catch(() => 'http://www.bridgeurl.com/vote-for-havoc/all');

		msg.respond({
			setTitle: this.user!.username,
			addField: [
				['❯Links',
					`- [Invite me](https://discordapp.com/oauth2/authorize?client_id=${this.user!.id}&scope=bot&permissions=2146958591)
            - [Vote for me](${await getVoteLink()})
            - [Support server](https://discord.gg/3Fewsxq)`, true],
				['❯Uptime', prettyMs(this.uptime!), true],
				['❯Memory usage', `${(process.memoryUsage().heapUsed / 1048576).toFixed(2)}MB (${(process.memoryUsage().heapUsed / os.totalmem() * 100).toFixed(2)}%)`, true],
				['❯Totals',
					`- Servers: ${this.guilds.size}
            - Users: ${`~${this.guilds.reduce((total: number, guild) => total + guild.memberCount, 0)}`}
            - Cached users: ${this.users.size}
            - Channels: ${this.channels.size}
            - Cached messages: ${this.channels.filter(channel => 'messages' in channel).reduce((total: number, channel) => total + (channel as TextChannel | DMChannel).messages.size, 0)}`, true],
				['❯Github', '[izexi](https://github.com/izexi/Havoc)', true],
				['❯Versions',
					`- [discord.js](https://github.com/discordjs/discord.js): v${version}
            - Node.js: ${process.version}`, true]
			]
		});
	}
}
