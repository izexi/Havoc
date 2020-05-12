import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import GuildEntity from '../../structures/entities/GuildEntity';
import Havoc from '../../client/Havoc';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: 'Disable the welcomer for this server.',
      sub: true,
      requiredPerms: 'MANAGE_GUILD',
    });
  }

  async run(this: Havoc, { message }: { message: HavocMessage }) {
    const guildEntity = await this.db.find(GuildEntity, message.guild!.id);

    if (!guildEntity || !guildEntity.welcomer)
      return message.respond(`welcomer has not been enabled on this server.`);

    delete guildEntity.welcomer;
    await this.db.flush();

    message.respond(`I have disabled welcomer for this server.`);
  }
}
