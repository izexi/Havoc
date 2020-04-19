import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { Util } from 'discord.js';
import { find } from 'node-emoji';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: 'Enlarges the inputted emoji',
      args: {
        type: message => {
          const { arg: possibleEmoji } = message;
          if (!possibleEmoji) return;

          const customEmoji = Util.parseEmoji(possibleEmoji);
          if (customEmoji)
            return message.shiftArg(
              `https://cdn.discordapp.com/emojis/${customEmoji.id}.${
                customEmoji.animated ? 'gif' : 'png'
              }`
            );

          const unicodeEmoji = find(possibleEmoji);
          return message.shiftArg(
            `https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/${unicodeEmoji.emoji
              .codePointAt(0)
              ?.toString(16)}.png`
          );
        },
        required: true,
        promptOpts: {
          initial: 'enter the emoji that you would like to enlarge.',
          invalid: 'you need to enter a custom or unicode emoji.'
        }
      }
    });
  }

  async run({ message, fn: url }: { message: HavocMessage; fn: string }) {
    await message.delete();
    message.channel.send(
      message
        .constructEmbed({
          setImage: url,
          setAuthor: [message.member!.displayName, message.author.pfp]
        })
        // @ts-ignore
        .setTimestamp(null)
    );
  }
}
