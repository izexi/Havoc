import { MessageEmbed } from 'discord.js';
import HavocClient from '../client/Havoc';
import HavocTextChannel from '../extensions/TextChannel';

export default function(this: HavocClient, id: number, replayedEvents: number) {
	(this.channels.get('614043112662368277') as HavocTextChannel).send(
		new MessageEmbed()
			.setTitle(`Shard ${id} is resuming (replaying ${replayedEvents} events)`)
			.setColor('YELLOW')
			.setTimestamp()
	).catch(() => null);
}
