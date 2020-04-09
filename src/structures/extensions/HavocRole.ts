import { GuildMember, Role } from 'discord.js';

export default class extends Role {
  canBe(action: 'added' | 'removed' | 'deleted', member?: GuildMember) {
    let response;
    const formattedAction =
      action === 'added'
        ? `add this role to ${member?.user.tag}`
        : action === 'removed'
        ? `remove this role from ${member?.user.tag}`
        : 'delete this role';

    if (this.guild.me!.roles.highest.comparePositionTo(this) < 1)
      response = `the role \`${
        this.name
      }\` has a higher / equivalent position compared to my highest role \`${
        this.guild.me!.roles.highest.name
      }\`, therefore I do not have permission to ${formattedAction}.`;

    if (member) {
      if (
        member.roles.highest.comparePositionTo(this) < 1 &&
        this.id !== this.guild.ownerID
      )
        response = `the role \`${this.name}\` has a higher / equivalent position compared to your highest role \`${member.roles.highest.name}\`, therefore you do not have permission to ${formattedAction}.`;

      const hasRole = member.roles.cache.has(this.id);
      if (action === 'added' ? hasRole : !hasRole)
        response = `${member.user.tag} ${
          hasRole ? 'already has' : "doesn't have"
        } the \`${this.name}\` role.`;
    }
    return response;
  }
}
