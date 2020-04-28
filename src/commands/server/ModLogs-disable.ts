import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import GuildEntity from '../../structures/entities/GuildEntity';
import Havoc from '../../client/Havoc';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: 'Disable the logs for this server.',
      sub: true,
      requiredPerms: 'MANAGE_GUILD'
    });
  }

  async run(this: Havoc, { message }: { message: HavocMessage }) {
    const guildEntity = await this.db.find(GuildEntity, message.guild!.id);

    if (!guildEntity || !guildEntity.modlogs)
      return message.respond(`mod logs have not been enabled on this server.`);

    delete message.guild!.modlogs;
    delete guildEntity.modlogs;
    await this.db.flush();

    message.respond(`I have disabled mod logs for this server.`);
  }
}
