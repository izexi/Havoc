import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import * as moment from 'moment';
import HavocGuild from '../../structures/extensions/HavocGuild';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: 'View info about the server.',
      aliases: ['sinfo', 'server']
    });
  }

  async run({ message }: { message: HavocMessage }) {
    const guild = message.guild as HavocGuild;

    message.respond({
      setThumbnail: guild.iconURL(),
      addFields: [
        { name: '❯Name', value: guild.name, inline: true },
        {
          name: '❯Owner',
          value: (await message.client.users.fetch(guild.ownerID)).tag,
          inline: true
        },
        { name: '❯Members', value: guild.memberCount.toString(), inline: true },
        {
          name: 'Roles',
          value: `${guild.roles.cache.size} (You can view a list of all roles by doing \`${message.prefix}rolelist\`)`,
          inline: true
        },
        {
          name: 'Emojis',
          value: `${guild.emojis.cache.size} (You can view a list of all emojis by doing \`${message.prefix}emojilist\`)`,
          inline: true
        },
        {
          name: 'Categories',
          value: guild.channels.cache
            .filter(channel => channel.type === 'category')
            .size.toString(),
          inline: true
        },
        {
          name: 'Text channels',
          value: guild.channels.cache
            .filter(channel => channel.type === 'text')
            .size.toString(),
          inline: true
        },
        {
          name: 'Voice channels',
          value: guild.channels.cache
            .filter(channel => channel.type === 'voice')
            .size.toString(),
          inline: true
        },
        {
          name: 'Created at',
          value: moment(guild.createdAt).format('LLLL'),
          inline: true
        },
        { name: 'Region', value: guild.region, inline: true }
      ]
    });
  }
}
