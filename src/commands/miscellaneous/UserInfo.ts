import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import * as moment from 'moment';
import { Target } from '../../util/targetter';
import HavocUser from '../../structures/extensions/HavocUser';
import Util from '../../util';

export default class extends Command {
  constructor() {
    super(__filename, {
      dm: true,
      description: 'View info about a user.',
      aliases: ['uinfo', 'user'],
      args: { type: Target.USER }
    });
  }

  async run({
    message,
    user
  }: {
    message: HavocMessage;
    user: HavocUser | null;
  }) {
    if (!user) user = message.author;
    const fields = [
      { name: '❯ID', value: user.id, inline: true },
      { name: '❯Tag', value: user.tag, inline: true },
      {
        name: '❯Status',
        value: Util.captialise(user.presence.status),
        inline: true
      }
    ];

    if (message.guild) {
      const member = await message.guild.members.fetch(user);
      fields.push({
        name: '❯Joined server at',
        value: moment(member.joinedAt!).format('LLLL'),
        inline: true
      });
      if (member.roles.cache.size > 1) {
        fields.push({
          name: 'Roles',
          value: member.roles.cache
            .filter(role => role.id !== message.guild!.id)
            .sort((prev, curr) => curr.position - prev.position)
            .map(role => role.toString())
            .join(', '),
          inline: true
        });
      }
    }

    const {
      presence: { activities }
    } = user;
    if (activities.length)
      fields.push({
        name: `❯Activit${activities.length > 1 ? 'ies' : 'y'}`,
        value:
          activities.length > 1
            ? activities.map(activity => `• ${activity.name}`).join('\n')
            : activities[0].name,
        inline: true
      });

    message.sendEmbed({
      setThumbnail: user.pfp,
      addFields: fields
    });
  }
}
