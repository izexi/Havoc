import HavocClient from '../client/Havoc';
import { MessageEmbed } from 'discord.js';
import Log from '../structures/bases/Log';
import HavocGuild from '../extensions/Guild';
import HavocMessage from '../extensions/Message';
import Util from '../util/Util';

export default async function(this: HavocClient, outdated: HavocMessage, updated: HavocMessage) {
	if (updated.content === outdated.content) return;
	const embed = new MessageEmbed()
		.setDescription(`
			${outdated.content.length < 900 ? `**📝Before  :** ${Util.codeblock(outdated.content)}` : ''}
			${updated.content.length < 900 ? `**✏After :** ${Util.codeblock(updated.content)}` : ''}
			**📅Timestamp of message :**  ${outdated.createdAt.toLocaleString()} (UTC)
			**📂Channel :**  ${updated.channel}
			**✍Message author :**  ${updated.author}
		`)
		.setColor('RED')
		.setAuthor(`${updated.author.tag}'s message was edited`, updated.author.pfp)
		.setFooter(`Message ID: ${updated.id}`)
		.setTimestamp();
	let txt = '';
	if (outdated.content.length >= 900) txt += `BEFORE:\r\n${outdated.content}`;
	if (updated.content.length >= 900) txt += `\nAFTER:\r\n${updated.content}`;
	embed.attachFiles([{
		attachment: Buffer.from(txt, 'utf8'),
		name: 'edited_content.txt'
	}]);
	Log.send(updated.guild as HavocGuild, embed);
}
