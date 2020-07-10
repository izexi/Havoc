import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import GuildEntity from '../../structures/entities/GuildEntity';
import Havoc from '../../client/Havoc';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: 'Disable the logs for this server.',
      sub: true,
      requiredPerms: 'MANAGE_GUILD',
    });
  }

  async run(this: Havoc, { message }: { message: HavocMessage }) {
    const guildEntity = await this.db.find(GuildEntity, message.guild!.id);

    if (!guildEntity || !guildEntity.logs)
      return message.respond(`logs have not been enabled on this server.`);

    const webhooks = await message.guild!.fetchWebhooks();
    const logHook =
      webhooks.get(guildEntity.logs.webhook.id!) ||
      webhooks.find(
        (webhook) =>
          // @ts-ignore
          webhook.owner?.id === this.user!.id &&
          (webhook.name === ',HavocLogs' || webhook.name === 'HavocLogs')
      );
    await logHook?.delete();

    delete guildEntity.logs;
    delete message.guild!.config?.logs;
    await this.db.flush();

    message.respond(`I have disabled logs for this server.`);
  }
}
