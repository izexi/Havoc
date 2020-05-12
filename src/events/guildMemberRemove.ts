import HavocGuild from '../structures/extensions/HavocGuild';
import HavocGuildMember from '../structures/extensions/HavocGuildMember';
import { MessageEmbed } from 'discord.js';
import Util from '../util';
import HavocTextChannel from '../structures/extensions/HavocTextChannel';

export default async function (member: HavocGuildMember) {
  const guild = member.guild as HavocGuild;
  if (!guild || guild.logs?.disabled.includes(10)) return;

  if (guild.welcomer) {
    (guild.channels.cache.get(guild.welcomer) as HavocTextChannel)?.send(
      member.toString(),
      new MessageEmbed()
        .setDescription(
          `
				**${member.user.tag}** has left the **${member.guild.name}** server 👋
				${
          member.lastMessage && member.lastMessage.content
            ? `\nTheir last words were:\n ❝${
                member.lastMessage.content
              }❞ - ${Util.smallCaps(member.user.username)}`
            : ''
        }⠀⠀⠀⠀
			`
        )
        .setThumbnail(member.user.displayAvatarURL())
        .setColor('RANDOM')
        .setFooter('A member left!', (member.guild as HavocGuild).iconURL())
        .setTimestamp()
    );
  }

  const fields = [
    {
      name: '**📆 Account created at :**',
      value: `${member.user.createdAt.toLocaleString()} (UTC)`,
    },
  ];
  if (member.joinedTimestamp)
    fields.push({
      name: '**🗓 Joined guild at :**',
      value: `${member.joinedAt!.toLocaleString()} (UTC)`,
    });

  guild.sendLog({
    addFields: [
      ...fields,
      {
        name: '**ℹ Guild member count :**',
        value: member.guild.memberCount.toString(),
      },
    ],
    setColor: 'RED',
    setAuthor: [`${member.user.tag} left`, guild.iconURL()],
    setFooter: `Member ID: ${member.id}`,
  });
}
