import Command from '../../structures/bases/Command';
import HavocMessage, {
  EmbedMethods
} from '../../structures/extensions/HavocMessage';
import { Target } from '../../util/Targetter';
import { GuildEmoji } from 'discord.js';
import { Emoji } from 'node-emoji';
import * as moment from 'moment';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: 'View info about an emoji.',
      args: {
        type: Target.EMOJI,
        required: true,
        prompt: 'enter the emoji that you would like info about.'
      }
    });
  }

  async run({
    message,
    emoji
  }: {
    message: HavocMessage;
    emoji: GuildEmoji | Emoji;
  }) {
    let embed: Partial<EmbedMethods>;
    if (emoji instanceof GuildEmoji) {
      embed = {
        setThumbnail: emoji.url,
        addFields: [
          { name: '❯Emoji', value: emoji.toString(), inline: true },
          { name: '❯Name', value: `\`:${emoji.name}:\``, inline: true },
          { name: '❯ID', value: emoji.id, inline: true },
          {
            name: '❯Created by',
            value: (await emoji.fetchAuthor()).tag,
            inline: false
          },
          {
            name: '❯Created at',
            value: moment(emoji.createdAt!).format('LLLL'),
            inline: true
          },
          { name: '❯URL', value: emoji.url, inline: false }
        ]
      };
    } else {
      const url = `https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/${emoji.emoji
        .codePointAt(0)
        ?.toString(16)}.png`;
      embed = {
        setThumbnail: url,
        addFields: [
          {
            name: '❯Emoji',
            value: `\`${emoji.emoji}\` ${emoji.emoji}`,
            inline: false
          },
          { name: '❯Name', value: `\`:${emoji.key}:\``, inline: false }
        ]
      };
    }

    message.respond(embed);
  }
}
