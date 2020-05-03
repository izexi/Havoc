import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { Util as DjsUtil } from 'discord.js';
import { URL } from 'url';
import fetch from 'node-fetch';
import { Target } from '../../util/targetter';
import Util from '../../util';
import { MAX_LIMITS, MIN_LIMITS, PROMPT_ENTER } from '../../util/CONSTANTS';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: 'Uploads the inputted custom emoji to the server.',
      aliases: ['uemoji'],
      args: [
        {
          name: 'emoji | url',
          example: [
            '<:POGGIES:542850548043612190>',
            'https://cdn.discordapp.com/emojis/542850548043612190.png?v=1'
          ],
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
          prompt: PROMPT_ENTER(
            'the emoji or url that you would like to upload as an emoji.'
          )
        },
        {
          name: 'name',
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
    const isAnimated = url.endsWith('gif');
    const currentEmojis = message.guild!.emojis.cache.filter(
      emoji => emoji.animated === isAnimated
    ).size;
    const maxEmojis = [50, 100, 150, 250][message.guild!.premiumTier];
    const emojiSize = await fetch(url).then(
      res => Number(res.headers.get('content-length')) / 1024
    );

    if (currentEmojis >= maxEmojis)
      invalidReason = `This server already has the maximum amount of emojis (${maxEmojis})`;
    else if (
      customName &&
      (customName.length < MIN_LIMITS.EMOJI_NAME ||
        customName.length > MAX_LIMITS.EMOJI_NAME)
    )
      invalidReason = `The emoji name must be between 2 and 32 characters, you entered one with ${customName.length} characters`;
    else if (!emojiSize || emojiSize > MAX_LIMITS.EMOJI_SIZE)
      invalidReason = `The is must be under 256kb in size, you entered one with ${emojiSize}kb`;

    if (invalidReason) return message.respond(invalidReason);

    message.respond(
      await message
        .guild!.emojis.create(url, customName || name || 'emoji', {
          reason: `Uploaded by ${message.author.tag}`
        })
        .then(
          emoji => `I have uploaded the emoji ${emoji} to this server.`,
          (
            err: Error
          ) => `I encountered an error while trying to upload this emoji
                ${Util.codeblock(err.toString())}`
        )
    );
  }
}
