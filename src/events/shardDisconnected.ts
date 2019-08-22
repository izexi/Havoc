import { MessageEmbed } from 'discord.js';
import HavocClient from '../client/Havoc';
import HavocTextChannel from '../extensions/TextChannel';

export default function(this: HavocClient, event: CloseEvent, id: number) {
	(this.channels.get('614043112662368277') as HavocTextChannel).send(
		new MessageEmbed()
			.setTitle(`Shard ${id} disconnected (${event.reason})`)
			.setColor('RED')
			.setTimestamp()
	).catch(() => null);
}
