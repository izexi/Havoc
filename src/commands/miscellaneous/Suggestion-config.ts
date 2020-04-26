import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { Target } from '../../util/targetter';
import GuildEntity from '../../structures/entities/GuildEntity';
import HavocTextChannel from '../../structures/extensions/HavocTextChannel';
import { PROMPT_INITIAL } from '../../util/CONSTANTS';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: 'Configure the suggestion channel for this server.',
      aliases: ['s-config', 'suggest-config'],
      args: {
        type: Target.CHANNEL,
        required: true,
        prompt: PROMPT_INITIAL[Target.CHANNEL](
          'the suggestions to be created on'
        )
      },
      sub: true,
      requiredPerms: 'MANAGE_GUILD'
    });
  }

  async run({
    message,
    channel
  }: {
    message: HavocMessage;
    channel: HavocTextChannel;
  }) {
    await message.client.db.upsert(GuildEntity, message.guild!.id, {
      suggestion: channel.id
    });

    message.respond(
      `I have updated the suggestions channel to ${channel} for this server.`
    );
  }
}
