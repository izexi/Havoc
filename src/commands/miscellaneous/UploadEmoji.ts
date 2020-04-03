import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { Util as DjsUtil } from 'discord.js';
import { URL } from 'url';
import fetch from 'node-fetch';
import { Target } from '../../util/Targetter';
import Util from '../../util/Util';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: 'Uploads the inputted custom emoji to the server.',
      aliases: ['uemoji'],
      args: [
        {
          type: async message => {
            const { arg: possibleEmoji } = message;
            if (!possibleEmoji) return;
            const emoji = DjsUtil.parseEmoji(possibleEmoji);
            if (emoji && emoji.id) {
              return message.shiftArg({
                url: `https://cdn.discordapp.com/emojis/${emoji.id}.${
                  emoji.animated ? 'gif' : 'png'
                }`,
                name: emoji.name
              });
            }
            try {
              new URL(possibleEmoji);
              const res = await fetch(possibleEmoji);
              if (!res.headers.get('content-type')?.includes('image'))
                return null;
              return message.shiftArg({ url: possibleEmoji });
            } catch {
              return null;
            }
          },
          required: true,
          prompt: 'enter the text that you would like to embed.'
        },
        {
          type: Target.TEXT
        }
      ],
      requiredPerms: 'MANAGE_EMOJIS'
    });
  }

  async run({
    message,
    fn: { url, name },
    text: customName
  }: {
    message: HavocMessage;
    fn: { url: string; name?: string };
    text: string;
  }) {
    let invalidReason;
    const maxEmojis = [50, 100, 150, 250][message.guild!.premiumTier];
    const emojiSize = await fetch(url).then(
      res => Number(res.headers.get('content-length')) / 1024
    );
    if (message.guild!.emojis.cache.size >= maxEmojis) {
      invalidReason = `This server already has the maximum amount of emojis (${maxEmojis})`;
    } else if (
      customName &&
      (customName.length < 2 || customName.length > 32)
    ) {
      invalidReason = `The emoji name must be between 2 and 32 characters, you entered one with ${customName.length} characters`;
    } else if (!emojiSize || emojiSize > 256) {
      invalidReason = `The is must be under 256kb in size, you entered one with ${emojiSize}kb`;
    }

    if (invalidReason) return message.respond(invalidReason);

    message.respond(
      await message
        .guild!.emojis.create(url, customName || name || 'emoji', {
          reason: `Uploaded by ${message.author.tag}`
        })
        .then(emoji => `I have uploaded the emoji ${emoji} to this server.`)
        .catch(
          (
            err: Error
          ) => `I encountered an error while trying to upload this emoji
                ${Util.codeblock(err.toString())}`
        )
    );
  }
}
