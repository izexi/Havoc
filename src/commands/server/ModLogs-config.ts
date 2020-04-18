import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { Target } from '../../util/Targetter';
import GuildEntity from '../../structures/entities/GuildEntity';
import Havoc from '../../client/Havoc';
import HavocTextChannel from '../../structures/extensions/HavocTextChannel';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: 'Configure the mod logs for this server.',
      aliases: ['modlogs-enable'],
      args: {
        type: Target.CHANNEL,
        required: true,
        prompt:
          'mention the channel, or enter the ID of the channel that would like to set the mod logs to.'
      },
      sub: true,
      requiredPerms: 'MANAGE_GUILD'
    });
  }

  async run(
    this: Havoc,
    { message, channel }: { message: HavocMessage; channel: HavocTextChannel }
  ) {
    const existing = await this.db
      .find(GuildEntity, message.guild!.id)
      .then(guild =>
        guild?.modlog ? message.guild!.channels.cache.get(guild.modlog) : null
      );

    await this.db.upsert(GuildEntity, message.guild!.id, {
      modlog: channel.id
    });

    message.respond(
      `${
        existing
          ? `I have updated the mod logs channel from ${existing} to ${channel}`
          : `I have enabled logs in ${channel} for this server.`
      }`
    );
  }
}
