import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import * as moment from 'moment';
import { Target } from '../../util/targetter';
import { PROMPT_INITIAL } from '../../util/CONSTANTS';
import { GuildChannel, NewsChannel } from 'discord.js';
import HavocTextChannel from '../../structures/extensions/HavocTextChannel';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: 'View info about a channel.',
      aliases: ['cinfo', 'channel'],
      args: {
        type: Target.CHANNEL,
        required: true,
        prompt: PROMPT_INITIAL[Target.CHANNEL]('to view info about'),
      },
    });
  }

  async run({
    message,
    channel,
  }: {
    message: HavocMessage;
    channel: GuildChannel;
  }) {
    if (!channel.permissionsFor(message.member)?.has('VIEW_CHANNEL'))
      return message.respond(
        'you do not have permission to view info about this channel (you need to be able to view it)'
      );

    const fields = [
      { name: '❯ID', value: channel.id, inline: true },
      { name: '❯Name', value: channel.name, inline: true },
      {
        name: '❯Type',
        value: channel.type,
        inline: true,
      },
    ];

    if (channel instanceof HavocTextChannel || channel instanceof NewsChannel) {
      fields.push(
        {
          name: '❯Topic',
          value: channel.topic ?? 'No topic set.',
          inline: true,
        },
        { name: '❯NSFW', value: channel.nsfw ? 'Yes' : 'No', inline: true }
      );

      if (channel.permissionsFor(message.member)?.has('READ_MESSAGE_HISTORY')) {
        const firstMessage = await channel.messages
          .fetch({ limit: 1, after: '0' })
          .then((messages) => messages.first()?.url);
        if (firstMessage)
          fields.push({
            name: '❯First Message',
            value: firstMessage,
            inline: true,
          });
      }
    }

    message.respond({
      addFields: [
        ...fields,
        {
          name: 'Created at',
          value: moment(channel.createdAt).format('LLLL'),
          inline: true,
        },
      ],
    });
  }
}
