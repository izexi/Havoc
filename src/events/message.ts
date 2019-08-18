import HavocMessage from '../extensions/Message';
import HavocClient from '../client/Havoc';
import Logger from '../util/Logger';
import HavocTextChannel from '../extensions/TextChannel';
import Util from '../util/Util';
import { MessageEmbed } from 'discord.js';

export function rejectionHandler(client: HavocClient, msg: HavocMessage, rej: Error) {
	(client.channels.get('612603429591973928') as HavocTextChannel).send(
		new MessageEmbed()
			.setDescription(`
				**Server:** ${msg.guild ? `${msg.guild.name} (${msg.guild.id})` : 'DM'}
				**Unhandled Rejection:** ${Util.codeblock((rej.stack || rej) as string)}
				**User:** ${msg.author.tag} (${msg.author.id})
				**Command:** ${msg.command.name}
				**Message Content:**
				${Util.codeblock(msg.content)}
				${msg.validArgs.size ? `**Valid Args:**\n${Util.codeblock([...msg.validArgs].join('\n'))}` : ''}
				${msg.promptResponses.size ? `**Prompt Responses:**\n${Util.codeblock([...msg.promptResponses].join('\n'))}` : ''}
			`)
			.setColor('ORANGE')
			.setAuthor(`⚠${rej}⚠`, msg.guild ? msg.guild.iconURL() : '')
			.setTimestamp()
			.setFooter('', msg.author.pfp)
	);
}

export default async function(this: HavocClient, msg: HavocMessage) {
	if (msg.author!.bot || msg.webhookID || !msg.prefix || !msg.content.startsWith(msg.prefix) || (msg.channel.type === 'text' && (msg.channel as HavocTextChannel).prompts.has(msg.author.id))) return;
	if (msg.guild) {
		const possibleTag = msg.guild.tags.get(msg.content.substring(msg.prefix.length));
		if (possibleTag) return msg.channel.send(possibleTag, { disableEveryone: true });
	}
	const command = this.commands.handler.get(msg.args.shift()!.substring(msg.prefix.length));
	if (!command || this.commands.disabled.has(command.name) || (command.category === 'dev' && msg.author.id !== this.havoc)) return;
	try {
		this.commands.handler.handle(msg, command).catch(rej => rejectionHandler(this, msg, rej));
		Logger.command(`${msg.author.tag} (${msg.author.id}) used command ${msg.prefix}${msg.command.name} in ${msg.guild ? msg.guild.name : 'DM'} ${msg.guild ? `(${msg.guild.id})` : ''} ${msg.channel instanceof HavocTextChannel ? `on #${msg.channel.name} (${msg.guild.id})` : ''}`);
	} catch (err) {
		Logger.error(`Error while executing command ${command.name}`, err);
		const id = Math.random()
			.toString(36)
			.substr(2, 9)
			.toUpperCase();
		msg.react('❗');
		(this.channels.get('406882982905774080') as HavocTextChannel).send(
			new MessageEmbed()
				.setDescription(`
					**Server:** ${msg.guild ? `${msg.guild.name} (${msg.guild.id})` : 'DM'}
					**Error:** ${Util.codeblock(err.stack)}
					**User:** ${msg.author.tag} (${msg.author.id})
					**Command:** ${msg.command.name}
					**Message Content:**
					${Util.codeblock(msg.content)}
					**Error ID:** ${id}
				`)
				.setColor('RED')
				.setAuthor(`❗${err}❗`, msg.guild ? msg.guild.iconURL() : '')
				.setTimestamp()
				.setFooter('', msg.author.pfp)
		);
		msg.channel.send(
			new MessageEmbed()
				.setColor('RED')
				.setDescription(`
					**❗I have encountered an error trying to execute the \`${msg.command.name}\` command❗**
					Check \`${msg.prefix}help ${msg.command.name}\` to check how to properly use the command
					However, if you have used the command correctly please join **https://discord.gg/3Fewsxq** and report your issue in the ${this.supportServer.members.has(msg.author.id) ? '<#406873476591517706>' : '#bugs-issues'} channel.
				`)
				.setFooter(`Error ID: ${id}`, msg.author.displayAvatarURL())
		);
	}
}
