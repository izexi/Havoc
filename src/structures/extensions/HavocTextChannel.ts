import {
  TextChannel,
  StringResolvable,
  MessageOptions,
  MessageAdditions,
  MessageEmbed,
} from 'discord.js';
import Util from '../../util';
import HavocUser from './HavocUser';
import { MAX_LIMITS } from '../../util/CONSTANTS';

export default class HavocTextChannel extends TextChannel {
  prompts: Set<HavocUser['id']> = new Set();

  // @ts-ignore
  async send(
    content?: StringResolvable,
    options?: MessageOptions | MessageAdditions
  ) {
    if (
      this.type === 'text' &&
      !this.permissionsFor(this.guild.me!)!.has([
        'VIEW_CHANNEL',
        'SEND_MESSAGES',
      ])
    )
      return;
    if (options instanceof MessageEmbed) {
      let { description } = options;
      if (
        typeof description === 'string' &&
        description.length > MAX_LIMITS.EMBED_DESCRIPTION
      ) {
        options.files = [
          {
            attachment: Buffer.from(description, 'utf8'),
            name: `${options.title || 'content'}.txt`,
          },
        ];
        options.description = await Util.haste(description);
      }
    }
    return super.send(content, options);
  }
}
