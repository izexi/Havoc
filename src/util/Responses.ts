import { Target } from './Targetter';
import { TextChannel } from 'discord.js';
import HavocMessage from '../structures/extensions/HavocMessage';

export const Responses: {
  [target in Target]?: (message: HavocMessage) => string;
} = {
  [Target.USER]: (message: HavocMessage) =>
    `You need to mention a user (e.g: ${
      message.author
    }) or enter the users's ID (e.g: \`${message.author.id}\`) or tag (e.g: \`${
      message.author.tag
    }\`)${
      message.member?.nickname
        ? ` or nickname (e.g: \`${message.member?.displayName})\``
        : ''
    } or username (e.g: \`${message.author.username}\`).`,

  [Target.MEMBER]: (message: HavocMessage) =>
    `You need to mention a member (e.g: ${
      message.member
    }) or enter the member's ID (e.g: \`${
      message.author.id
    }\`) or tag (e.g: \`${message.author.tag}\`)${
      message.member?.nickname
        ? ` or nickname (e.g: \`${message.member!.displayName})\``
        : ''
    } or username (e.g: \`${message.author.username}\`).`,

  [Target.ROLE]: (message: HavocMessage) => {
    const role = message.member?.roles.cache.random()!;
    return `You need to mention the role (e.g: ${role}) or enter the role's name (e.g: \`${role.name}\`).`;
  },

  [Target.CHANNEL]: (message: HavocMessage) =>
    `You need to mention the channel (e.g: ${
      message.channel
    }), enter the channel's name (e.g: \`${
      (message.channel as TextChannel).name
    }\`) or enter the channel's ID (e.g: \`${message.channel.id}\`).`,

  [Target.EMOJI]: (message: HavocMessage) => {
    const emoji = message.guild?.emojis.cache.random();
    return `You need to enter a the emoji itself (e.g: ${emoji}) or the id (e.g \`${emoji?.id}\`).`;
  }
};
