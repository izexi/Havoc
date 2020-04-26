import HavocGuild from '../structures/extensions/HavocGuild';
import HavocGuildMember from '../structures/extensions/HavocGuildMember';
import Havoc from '../client/Havoc';
import { getMuteRole } from '../commands/moderation/Mute';
import ms = require('ms');
import { MessageEmbed } from 'discord.js';
import Util from '../util';
import HavocTextChannel from '../structures/extensions/HavocTextChannel';

export default async function(this: Havoc, member: HavocGuildMember) {
  const guild = member.guild as HavocGuild;
  if (!guild || guild.logs?.disabled.includes(9)) return;

  const guildEntity = await this.db.guildRepo.findOne(
    {
      mutes: {
        guild: guild.id,
        member: member.id
      }
    },
    { populate: ['mutes'] }
  );
  await guildEntity?.mutes.init();

  const mute = guildEntity?.mutes
    .getItems()
    .find(muteEntity => muteEntity.member === member.id);
  if (mute) {
    const muteRole = await getMuteRole(guild);
    if (muteRole)
      await member.roles.add(
        muteRole,
        `Continuation for ${ms(
          new Date(mute.end!).getTime() - new Date(mute.start).getTime()
        )} mute by ${(await this.users.fetch(mute.muter)).tag}`
      );
  }

  if (guild.autorole) {
    const role = guild.roles.cache.get(guild.autorole);
    if (role) member.roles.add(role, 'Auto role');
  }

  if (guild.welcomer) {
    const emojis = ['✨', '🎉', '⚡', '🔥', '☄', '💨', '🌙', '💥'];

    (guild.channels.cache.get(guild.welcomer) as HavocTextChannel)?.send(
      member.toString(),
      new MessageEmbed()
        .setDescription(
          `
				**${member.user.tag}**
				Welcome to the **${member.guild.name}** server! ⠀ 
				You're the ${Util.ordinal(
          member.guild.memberCount
        )} member here ${Util.randomArrEl(emojis)}
				⠀⠀⠀⠀⠀⠀⠀
			`
        )
        .setThumbnail(member.user.displayAvatarURL())
        .setColor('RANDOM')
        .setFooter('New member joined!', (member.guild as HavocGuild).iconURL())
        .setTimestamp()
    );
  }

  guild.sendLog({
    addFields: [
      {
        name: '**📆 Account created at :**',
        value: `${member.user.createdAt.toLocaleString()} (UTC)`
      },
      {
        name: '**ℹ Guild member count :**',
        value: member.guild.memberCount.toString()
      }
    ],
    setColor: 'GREEN',
    setAuthor: [`${member.user.tag} joined`, guild.iconURL()],
    setFooter: `Member ID: ${member.id}`
  });
}
