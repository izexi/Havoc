import HavocMessage, {
  EmbedMethods
} from '../structures/extensions/HavocMessage';
import HavocTextChannel from '../structures/extensions/HavocTextChannel';
import Util from '../util/Util';
import HavocGuild from '../structures/extensions/HavocGuild';

export default async function(message: HavocMessage) {
  const guild = message.guild as HavocGuild;
  if (
    !guild ||
    guild.logs?.disabled.includes(15) ||
    message.author.bot ||
    (message.channel instanceof HavocTextChannel &&
      message.channel.prompts.has(message.author.id))
  )
    return;

  const attachments = [];
  const fields = [
    {
      name: '**📅 Timestamp of message :**',
      value: `${message.createdAt.toLocaleString()} (UTC)`
    },
    {
      name: '**📂 Channel :**',
      value: message.channel.toString(),
      inline: true
    },
    {
      name: '**✍ Message author :**',
      value: message.author.toString(),
      inline: true
    }
  ];
  if (message.content && message.content.length < 1800)
    fields.push({
      name: '**🗒 Message content :**',
      value: Util.codeblock(message.content)
    });

  const embed: Partial<EmbedMethods> = {
    addFields: fields,
    setColor: 'RED',
    setAuthor: [
      `${message.author.tag}'s message was deleted`,
      message.author.pfp
    ],
    setFooter: `Message ID: ${message.id}`
  };

  if (message.attachments.size) {
    attachments.push({
      attachment: message.attachments.first()!.proxyURL,
      name: 'deleted.png'
    });
    embed.setImage = 'attachment://deleted.png';
  }
  if (message.content.length >= 1800) {
    attachments.push({
      attachment: Buffer.from(message.content, 'utf8'),
      name: 'deleted_content.txt'
    });
  }
  if (attachments.length) embed.attachFiles = attachments;

  guild.sendLog(embed);
}
