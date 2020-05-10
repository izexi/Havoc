import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { Target } from '../../util/targetter';
import GuildEntity, { Logs } from '../../structures/entities/GuildEntity';
import Havoc from '../../client/Havoc';
import HavocTextChannel from '../../structures/extensions/HavocTextChannel';
import { PROMPT_INITIAL } from '../../util/CONSTANTS';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: 'Enable logs for this server.',
      args: {
        type: Target.CHANNEL,
        required: true,
        prompt: PROMPT_INITIAL[Target.CHANNEL]('to set the logs to')
      },
      sub: true,
      requiredPerms: 'MANAGE_GUILD'
    });
  }

  async run(
    this: Havoc,
    { message, channel }: { message: HavocMessage; channel: HavocTextChannel }
  ) {
    let logs: Logs;
    const existing = await this.db
      .find(GuildEntity, message.guild!.id)
      .then(guild => guild?.logs);

    if (existing) {
      if (existing.channel === channel.id)
        return message.respond(`logs are already enabled in ${channel}`);

      logs = {
        ...existing,
        channel: channel.id
      };
    } else {
      const webhook = await channel.createWebhook(',HavocLogs', {
        avatar: this.user!.displayAvatarURL()
      });

      logs = {
        disabled: [],
        channel: channel.id,
        webhook: {
          id: webhook.id,
          token: webhook.token!
        }
      };
    }

    message.guild!.logs = logs;
    await this.db.upsert(GuildEntity, message.guild!.id, { logs });

    message.respond(
      `${
        existing
          ? `I have updated the logs channel from ${message.guild!.channels.cache.get(
              existing.channel
            )} to ${channel}`
          : `I have enabled logs in ${channel} for this server.`
      }`
    );
  }
}
