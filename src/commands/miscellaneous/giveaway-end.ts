import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import GiveawaySchedule from '../../schedules/Giveaway';

export default class GiveawayEnd extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b1000,
			description: 'Ends a giveaway.',
			aliases: new Set(['g-end']),
			args: [{
				key: 'giveaway',
				type: (msg: HavocMessage) => msg.client.scheduler.find(g => (g as GiveawaySchedule).message === msg.args[0]),
				prompt: {
					initialMsg: 'enter the ID of the giveaway that you would like to end right now which you can find on the footer of the giveaways\'s embed',
					invalidResponseMsg: 'You have entered an invalid Giveaway ID https://i.imgur.com/jZpv4Fk.png'
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

	public async run(this: HavocClient, { msg, target: { giveaway } }: { msg: HavocMessage; target: { giveaway: GiveawaySchedule } }) {
		await giveaway.end();
		this.scheduler.delete(giveaway.endTime);
		msg.response = await msg.sendEmbed({
			setDescription: `**${msg.author.tag}** I have ended the [giveaway](https://discordapp.com/channels/${msg.guild.id}/${giveaway.channel}/${giveaway.message}).`
		});
	}
}
