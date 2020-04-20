import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { Target } from '../../util/Targetter';
import GuildEntity from '../../structures/entities/GuildEntity';
import { Role } from 'discord.js';
import Havoc from '../../client/Havoc';

export default class extends Command {
  constructor() {
    super(__filename, {
      description:
        'Configure the autorole (role to add to members as they join) for this server.',
      aliases: ['autorole-enable'],
      args: {
        type: Target.ROLE,
        required: true,
        prompt:
          'mention the role, or enter the ID of the role that would like to set as the autorol.'
      },
      sub: true,
      requiredPerms: 'MANAGE_GUILD'
    });
  }

  async run(
    this: Havoc,
    { message, role }: { message: HavocMessage; role: Role }
  ) {
    const existing = await this.db
      .find(GuildEntity, message.guild!.id)
      .then(guild =>
        guild?.autorole ? message.guild!.roles.cache.get(guild.autorole) : null
      );

    message.guild!.autorole = role.id;
    await this.db.upsert(GuildEntity, message.guild!.id, {
      autorole: role.id
    });

    message.respond(
      `${
        existing
          ? `I have updated the autorole from ${existing} to ${role}`
          : `I have enabled autorole for ${role} for this server.`
      }`
    );
  }
}
