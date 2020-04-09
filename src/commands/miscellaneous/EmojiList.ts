import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { GuildEmoji } from 'discord.js';
import Util from '../../util/Util';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: 'View a list of emojis on this server.',
      aliases: ['el', 'emojis', 'emojislist']
    });
  }

  async run({ message }: { message: HavocMessage }) {
    const emojis = message.guild!.emojis.cache;
    const emojiFormat = (emoji: GuildEmoji) =>
      `• ${emoji.toString()} - \`:${emoji.name}:\``;
    const [animated, normal] = emojis.partition(
      (emoji: GuildEmoji) => emoji.animated
    );

    message.paginate({
      title: `List of ${emojis.size} ${Util.plural('emoji', emojis.size)} in ${
        message.guild!.name
      }`,
      descriptions: [
        '__**Emojis**__\n',
        ...normal.map(emojiFormat),
        '\n__**Animated Emojis**__\n',
        ...animated.map(emojiFormat)
      ],
      maxPerPage: 20,
      page: Number(message.arg)
    });
  }
}
