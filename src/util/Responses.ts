import { Target } from './Targetter';
import { TextChannel } from 'discord.js';
import HavocMessage from '../structures/extensions/HavocMessage';

export const Responses: {
  [target in Target]?: (message: HavocMessage) => string;
} = {
  [Target.USER]: message =>
    `You need to mention a user (e.g: ${
      message.author
    }) or enter the users's ID (e.g: \`${message.author.id}\`) or tag (e.g: \`${
      message.author.tag
    }\`)${
      message.member?.nickname
        ? ` or nickname (e.g: \`${message.member?.displayName})\``
        : ''
    } or username (e.g: \`${message.author.username}\`).`,

  [Target.MEMBER]: message =>
    `You need to mention a member (e.g: ${
      message.member
    }) or enter the member's ID (e.g: \`${
      message.author.id
    }\`) or tag (e.g: \`${message.author.tag}\`)${
      message.member?.nickname
        ? ` or nickname (e.g: \`${message.member!.displayName})\``
        : ''
    } or username (e.g: \`${message.author.username}\`).`,

  [Target.ROLE]: message => {
    const role = message.member?.roles.cache.random()!;
    return `You need to mention the role (e.g: ${role}) or enter the role's name (e.g: \`${role.name}\`) or the role's ID (e.g: \`${role.id}\`).`;
  },

  [Target.CHANNEL]: message =>
    `You need to mention the channel (e.g: ${
      message.channel
    }), enter the channel's name (e.g: \`${
      (message.channel as TextChannel).name
    }\`) or enter the channel's ID (e.g: \`${message.channel.id}\`).`,

  [Target.EMOJI]: message => {
    const emoji = message.guild?.emojis.cache.random();
    return `You need to enter a the emoji itself (e.g: ${emoji}) or the id (e.g \`${emoji?.id}\`).`;
  },

  [Target.TIME]: () =>
    'You need to enter a valid time format (e.g: `5` would be 5 minutes or `5h` would be 5 hours or `5h30m5s` would be 5 hours, 30 minutes and 5 seconds)'
};
