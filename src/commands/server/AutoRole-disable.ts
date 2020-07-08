import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import GuildEntity from '../../structures/entities/GuildEntity';
import Havoc from '../../client/Havoc';

export default class extends Command {
  constructor() {
    super(__filename, {
      description:
        'Disable the autorole (role to add to members as they join) for this server.',
      sub: true,
      requiredPerms: 'MANAGE_GUILD',
    });
  }

  async run(this: Havoc, { message }: { message: HavocMessage }) {
    const guildEntity = await this.db.find(GuildEntity, message.guild!.id);
    const { config } = message.guild!;

    if (!guildEntity || !guildEntity.autorole)
      return message.respond(`autorole has not been enabled on this server.`);

    delete config!.autorole;
    delete guildEntity.autorole;
    await this.db.flush();

    message.respond(`I have disabled autorole for this server.`);
  }
}
