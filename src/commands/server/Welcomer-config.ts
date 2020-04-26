import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { Target } from '../../util/targetter';
import GuildEntity from '../../structures/entities/GuildEntity';
import Havoc from '../../client/Havoc';
import HavocTextChannel from '../../structures/extensions/HavocTextChannel';
import { PROMPT_INITIAL } from '../../util/CONSTANTS';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: 'Configure the welcomer for this server.',
      aliases: ['welcomer-enable'],
      args: {
        type: Target.CHANNEL,
        required: true,
        prompt: PROMPT_INITIAL[Target.CHANNEL]('set the welcomer to')
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
        guild?.welcomer
          ? message.guild!.channels.cache.get(guild.welcomer)
          : null
      );

    await this.db.upsert(GuildEntity, message.guild!.id, {
      welcomer: channel.id
    });

    message.respond(
      `${
        existing
          ? `I have updated the welcomer channel from ${existing} to ${channel}`
          : `I have enabled welcomer in ${channel} for this server.`
      }`
    );
  }
}
