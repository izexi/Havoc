import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import { MessageEmbed } from 'discord.js';
import HavocTextChannel from '../../extensions/TextChannel';
import { getGiveawayChannel } from './giveaway-start';

export default class GiveawayReroll extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b1000,
			description: 'Ends a giveaway.',
			aliases: new Set(['g-reroll']),
			args: [{
				key: 'giveawayMsg',
				type: async (msg: HavocMessage) => {
					const giveawayChannel = await getGiveawayChannel(msg) as HavocTextChannel;
					if (!giveawayChannel) return null;
					return giveawayChannel.messages.fetch(msg.args[0]).catch(() => null);
				},
				prompt: {
					initialMsg: 'enter the ID of the giveaway that you would like to end right now which you can find on the footer of the giveaways\'s embed',
					invalidResponseMsg: 'You have entered an invalid Giveaway ID https://i.imgur.com/jZpv4Fk.png'
				}
			},
			{
				key: 'winners',
				type: 'number',
				prompt: {
					initialMsg: 'enter the amount of winners that you would like to reroll.',
					invalidResponseMsg: 'You need to a enter a valid number. `5` would reroll 5 new winners on the giveaway for example'
				}
			}],
			userPerms: {
				role: async (msg: HavocMessage) => {
					const { giveaway } = await msg.guild.config;
					const { role }: { role: string } = giveaway || {};
					return role;
				},
				flags: ['MANAGE_GUILD']
			}
		});
	}

	public async run(this: HavocClient, { msg, target: { giveawayMsg, winners } }: { msg: HavocMessage; target: { giveawayMsg: HavocMessage; winners: number } }) {
		const reaction = giveawayMsg.reactions.get('🎉');
		if (!reaction) {
			return msg.response = await msg.sendEmbed({
				setDescription: `**${msg.author.tag}** a new winner could not be determined as there aren't any 🎉 reactions on the [giveaway](${giveawayMsg.url}).`
			});
		}
		const newWinners = (await reaction.users.fetch())
			.filter(user => user.id !== this.user!.id)
			.random(Number(winners))
			.filter(user => user);
		if (!newWinners.length) {
			return msg.response = await msg.sendEmbed({
				setDescription: `**${msg.author.tag}** a new winner could not be determined as there aren't enough 🎉 reactions on the [giveaway](${giveawayMsg.url}).`
			});
		}
		await giveawayMsg.sendEmbed({
			setDescription: `🎉 Congratulations **${newWinners.map(u => u.tag).join(', ')}**! You are the new winner of the [giveaway](${giveawayMsg.url}) for ${giveawayMsg.embeds[0].title} 🎉`,
			setColor: 'GOLD'
		}, newWinners.map(u => u.toString()).join(', '))
			.then(async () => {
				// eslint-disable-next-line promise/no-nesting
				Promise.all(newWinners.map(async u => u.send(
					new MessageEmbed()
						.setDescription(`🎉 Congratulations **${u.tag}**! You are the new winner of the [giveaway](${giveawayMsg.url}) for ${giveawayMsg.embeds[0].title} 🎉`)
						.setColor('GOLD')
				).catch(() => null))).catch(() => null);
			})
			.catch(() => null);
		return msg.response = await msg.sendEmbed({
			setDescription: `**${msg.author.tag}** a new winner has been rerolled on the [giveaway](${giveawayMsg.url}).`
		});
	}
}
