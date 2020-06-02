import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { Target } from '../../util/targetter';
import { GuildEmoji } from 'discord.js';
import { Emoji } from 'node-emoji';
import { PROMPT_INITIAL } from '../../util/CONSTANTS';

export default class extends Command {
  constructor() {
    super(__filename, {
      description:
        'Delete the inputted emoji from the server (with an optional reason).',
      args: [
        {
          type: Target.EMOJI,
          required: true,
          prompt: PROMPT_INITIAL[Target.EMOJI]('delete'),
        },
        {
          type: Target.TEXT,
        },
      ],
      requiredPerms: 'MANAGE_EMOJIS',
    });
  }

  async run({
    message,
    emoji,
    text: reason,
  }: {
    message: HavocMessage;
    emoji: GuildEmoji | Emoji;
    text?: string;
  }) {
    if (!(emoji instanceof GuildEmoji))
      return message.respond('you have entered an invalid emoji');

    await emoji.delete(reason);
    const [animated, nonAnimated] = message.guild!.emojis.cache.partition(
      (emoji) => emoji.animated
    );
    const maxEmojis = [50, 100, 150, 250][message.guild!.premiumTier];

    message.respond(
      `I have deleted the [emoji](${
        emoji.url
      }) from this server. There are now ${
        maxEmojis - nonAnimated.size
      } available slots for emojis and ${
        maxEmojis - animated.size
      } for animated emojis`
    );
  }
}
