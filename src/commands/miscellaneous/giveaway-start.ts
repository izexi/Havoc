import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import { GuildChannel } from 'discord.js';
import HavocTextChannel from '../../extensions/TextChannel';
import Util from '../../util/Util';
import GiveawaySchedule from '../../schedules/Giveaway';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ms = require('ms');

export async function getGiveawayChannel(msg: HavocMessage) {
	const existing = msg.guild.channels.find((channel: GuildChannel) => channel.name === 'giveaways');
	const { giveaway } = await msg.guild.config;
	if (!giveaway) {
		if (!existing) {
			msg.response = await msg.sendEmbed({
				setDescription: `**${msg.author.tag}** I couldn't find a \`#giveaways\` and a giveaway channel hasn't been configured.
				${msg.member!.permissions.has('MANAGE_GUILD') ? 'U' : 'You will need to ask someone with the `Manage Guild` permission to u'}se \`${msg.prefix}giveaway config\` to set one up.`
			});
			return null;
		}
		return existing;
	}
	const { channel } = giveaway;
	const giveawayChannel = msg.guild.channels.get(channel);
	if (!giveawayChannel) {
		msg.response = await msg.sendEmbed({
			setDescription: `**${msg.author.tag}** the giveaway channel that was in the configuration doesn't exist.
			${msg.member!.permissions.has('MANAGE_GUILD') ? 'U' : 'You will need to ask someone with the `Manage Guild` permission to u'}se \`${msg.prefix}giveaway config\` to set one up.`
		});
		return null;
	}
	return giveawayChannel;
}

export default class GiveawayStart extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b1000,
			description: 'Starts a giveaway with options.',
			aliases: new Set(['g-start']),
			args: [{
				type: 'time',
				prompt: {
					initialMsg: 'enter the time limit for how long the giveaway should last suffix the time with `w`/`d`/`h`/`m`/`s`, e.g: `3m5s` would be 3 minutes and 5 seconds.',
					invalidResponseMsg: 'You need to a enter a valid time format. `5h30m5s` would be 5 hours, 30 minutes and 5 seconds for example'
				}
			},
			{
				key: 'winners',
				type: 'number',
				prompt: {
					initialMsg: 'enter the amount of possible winners for the giveaway.',
					invalidResponseMsg: 'You need to a enter a valid number. `5` would allow the giveaway to have 5 winners for example'
				}
			},
			{
				key: 'prize',
				type: 'string',
				prompt: {
					initialMsg: 'enter the prize that of the giveaway.',
					invalidResponseMsg: 'You need to a enter the prize of the giveaway. `Nothing` would start a giveaway that has nothing as a prize for example.'
				}
			}],
			userPerms: {
				role: async (msg: HavocMessage) => {
					const { giveaway } = await msg.guild.config;
					const { role }: { role: string } = giveaway || {};
					return role;
				},
				flags: 'MANAGE_GUILD'
			}
		});
	}

	public async run(this: HavocClient, { msg, target: { time, winners, prize } }: { msg: HavocMessage; target: { time: number; winners: number; prize: string } }) {
		const giveawayChannel = await getGiveawayChannel(msg) as HavocTextChannel;
		if (!giveawayChannel) return;
		const embed = msg.constructEmbed({
			setTitle: prize,
			setDescription: `React with 🎉 to enter!\nTime remaining: **${ms(time, { 'long': true })}**`,
			setFooter: `${winners || 1} ${Util.plural('Winner', Number(winners) || 1)} | Ends at: `,
			setColor: 'GREEN'
		});
		if (time > 60000) embed.setTimestamp(Date.now() + time);
		// eslint-disable-next-line promise/catch-or-return
		giveawayChannel.send('🎉 **GIVEAWAY** 🎉', embed).then(async m => {
			if (m.deleted) return;
			await Promise.all([
				m.react('🎉'),
				m.edit(m.embeds[0].setFooter(`${winners || 1} ${Util.plural('Winner', Number(winners) || 1)} | Giveaway ID: ${m.id} | Ends at: `))
			]);
			if (time < 100) {
				setTimeout(async () => m.endGiveaway(Number(winners)), time as number);
			} else {
				await this.scheduler.add('giveaway',
					new GiveawaySchedule(this, Date.now() + (time as number), {
						channel: m.channel.id,
						message: m.id,
						winners: winners.toString()
					}));
			}
			msg.response = await msg.sendEmbed({
				setDescription: `**${msg.author.tag}** I have started the [giveaway](${m.url}).`
			});
		});
	}
}
