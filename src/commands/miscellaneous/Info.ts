import Command from '../../structures/bases/Command';
import Havoc from '../../client/Havoc';
import HavocMessage from '../../structures/extensions/HavocMessage';
import * as prettyMs from 'pretty-ms';
import os = require('os');
import { TextChannel, DMChannel, version } from 'discord.js';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: 'Info about me.',
      aliases: ['i', 'stats']
    });
  }

  async run(this: Havoc, { message }: { message: HavocMessage }) {
    const getVoteLink = () =>
      this.guilds.cache
        .get('406873117215031297')!
        .members.fetch(message.author)
        .then(
          () =>
            'https://discordapp.com/channels/406873117215031297/406873578458447873/535928285402628106'
        )
        .catch(() => 'http://www.bridgeurl.com/vote-for-havoc/all');

    message.respond({
      setTitle: this.user!.username,
      addFields: [
        {
          name: '❯Links',
          value: `- [Invite me](https://discordapp.com/oauth2/authorize?client_id=${
            this.user!.id
          }&scope=bot&permissions=2146958591)
            - [Vote for me](${await getVoteLink()})
            - [Support server](https://discord.gg/3Fewsxq)`,
          inline: true
        },
        {
          name: '❯Uptime',
          value: `- Shard: ${prettyMs(this.uptime!)}
                  - Process: ${prettyMs(process.uptime())}`,
          inline: true
        },
        {
          name: '❯Memory usage',
          value: `${(process.memoryUsage().heapUsed / 1048576).toFixed(
            2
          )}MB (${(
            (process.memoryUsage().heapUsed / os.totalmem()) *
            100
          ).toFixed(2)}%)`,
          inline: true
        },
        {
          name: '❯Stats',
          value: `- Servers: ${this.guilds.cache.size}
            - Users: ${`~${this.guilds.cache.reduce(
              (total, guild) => total + guild.memberCount,
              0
            )}`}
            - Cached users: ${this.users.cache.size}
            - Channels: ${this.channels.cache.size}
            - Cached messages: ${this.channels.cache
              .filter(channel => 'messages' in channel)
              .reduce(
                (total, channel) =>
                  total +
                  (channel as TextChannel | DMChannel).messages.cache.size,
                0
              )}`,
          inline: true
        },
        {
          name: '❯Github',
          value: '[izexi](https://github.com/izexi/Havoc)',
          inline: true
        },
        {
          name: '❯Versions',
          value: `- [discord.js](https://github.com/discordjs/discord.js): v${version}
            - Node.js: ${process.version}`,
          inline: true
        }
      ]
    });
  }
}
