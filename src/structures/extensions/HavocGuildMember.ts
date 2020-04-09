import { GuildMember } from 'discord.js';

export default class extends GuildMember {
  can(
    action:
      | 'nick'
      | 'warn'
      | 'unwarn'
      | 'unmute'
      | 'mute'
      | 'kick'
      | 'softban'
      | 'ban',
    target: GuildMember,
    checkOwner = true
  ) {
    let response;
    const { tag } = this.user;
    const highestRole = this.roles.highest;
    const highestTargetRole = target.roles.highest;
    const highestMeRole = this.guild.me!.roles.highest;
    const formattedAction =
      action === 'nick' ? 'change their nickname' : `${action} this member`;

    if (checkOwner && target.id === this.guild.ownerID)
      response = `${tag} is the owner of this server, therefore I do not have permission to ${formattedAction}.`;
    else if (highestMeRole.comparePositionTo(highestTargetRole) < 1)
      response = `${tag} has the role \`${highestTargetRole.name}\` which has a higher / equivalent position compared to my highest role \`${highestMeRole.name}\`, therefore I do not have permission to ${formattedAction}.`;
    else if (
      highestRole.comparePositionTo(highestTargetRole) < 1 &&
      this.id !== this.guild.ownerID
    ) {
      response = `${tag} has the role \`${highestTargetRole.name}\` which has a higher / equivalent position compared to your highest role \`${highestRole.name}\`, therefore you do not have permission to ${formattedAction}.`;
    }
    return response;
  }
}
