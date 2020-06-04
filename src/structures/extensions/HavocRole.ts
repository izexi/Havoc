import { GuildMember, Role } from 'discord.js';

export default class extends Role {
  isLowerThan(role: Role | this) {
    return this.comparePositionTo(role) < 1;
  }

  canBe({
    action,
    member,
    target,
  }: {
    action: 'added' | 'removed' | 'deleted';
    member?: GuildMember;
    target?: GuildMember;
  }) {
    let response;
    const formattedAction =
      action === 'added'
        ? `add this role to ${target?.user.tag}`
        : action === 'removed'
        ? `remove this role from ${target?.user.tag}`
        : 'delete this role';

    if (this.managed)
      return `the role \`${this.name}\` is a managed role, therefore I do not have permission to interact with this role.`;

    if ((this.guild.me!.roles.highest as this).isLowerThan(this))
      response = `the role \`${
        this.name
      }\` has a higher / equivalent position compared to my highest role \`${
        this.guild.me!.roles.highest.name
      }\`, therefore I do not have permission to ${formattedAction}.`;

    if (member) {
      if (
        (member.roles.highest as this).isLowerThan(this) &&
        this.id !== this.guild.ownerID
      )
        response = `the role \`${this.name}\` has a higher / equivalent position compared to your highest role \`${member.roles.highest.name}\`, therefore you do not have permission to ${formattedAction}.`;

      const hasRole = target!.roles.cache.has(this.id);
      if (action === 'added' ? hasRole : !hasRole)
        response = `${target!.user.tag} ${
          hasRole ? 'already has' : "doesn't have"
        } the \`${this.name}\` role.`;
    }
    return response;
  }
}
