import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { Target } from '../../util/Targetter';
import GuildEntity from '../../structures/entities/GuildEntity';
import HavocTextChannel from '../../structures/extensions/HavocTextChannel';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: 'Configure the giveaway channel for this server.',
      args: {
        type: Target.CHANNEL,
        required: true,
        prompt:
          'mention the channel, or enter the ID of the channel that would like the giveaways to be created on.'
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
      giveaway: channel.id
    });
    await message.respond(
      `I have updated the giveaways channel to ${channel} for this server.`
    );
  }
}
