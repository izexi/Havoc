import HavocMessage, {
  EmbedMethods
} from '../structures/extensions/HavocMessage';
import Util from '../util/Util';
import HavocGuild from '../structures/extensions/HavocGuild';
import Havoc from '../client/Havoc';

export default async function(
  this: Havoc,
  outdated: HavocMessage,
  updated: HavocMessage
) {
  const guild = updated.guild as HavocGuild;
  if (
    !guild ||
    guild.logs?.disabled.includes(14) ||
    updated.content === outdated.content ||
    outdated.author.bot
  )
    return;

  updated.args = updated.content.split(/ +/);
  await this.commandHandler.handle(updated);
  if (updated.command) return;

  const fields = [
    {
      name: '**📅 Timestamp of message :**',
      value: `${outdated.createdAt.toLocaleString()} (UTC)`
    },
    {
      name: '**📂 Channel :**',
      value: updated.channel.toString(),
      inline: true
    },
    {
      name: '**✍ Message author :**',
      value: updated.author.toString(),
      inline: true
    }
  ];
  if (updated.content.length < 900)
    fields.unshift({
      name: '**✏ After :**',
      value: Util.codeblock(updated.content)
    });
  if (outdated.content.length < 900)
    fields.unshift({
      name: '**📝 Before :**',
      value: Util.codeblock(outdated.content)
    });

  const embed: Partial<EmbedMethods> = {
    addFields: fields,
    setColor: 'ORANGE',
    setAuthor: [
      `${updated.author.tag}'s message was edited`,
      updated.author.pfp
    ],
    setFooter: `Message ID: ${updated.id}`
  };

  let content = '';
  if (outdated.content.length >= 900)
    content += `BEFORE:\r\n${outdated.content}`;
  if (updated.content.length >= 900)
    content += `\nAFTER:\r\n${updated.content}`;
  if (content) {
    embed.attachFiles = [
      {
        attachment: Buffer.from(content, 'utf8'),
        name: 'edited_content.txt'
      }
    ];
  }

  guild.sendLog(embed);
}
