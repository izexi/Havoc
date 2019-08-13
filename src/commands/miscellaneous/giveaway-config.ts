import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import HavocTextChannel from '../../extensions/TextChannel';
import { Role } from 'discord.js';

export default class GiveawayConfig extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b1000,
			description: 'Ends a giveaway.',
			aliases: new Set(['g-config']),
			args: [{
				key: 'option',
				type: (msg: HavocMessage) => ['channel', 'role'].includes(msg.arg.toLowerCase()),
				prompt: {
					initialMsg: 'what would you like to configure from giveaways?\nEnter `channel` / `role`.',
					invalidResponseMsg: 'You will need to enter either `channel` or `role`.'
				}
			},
			{
				key: 'channelOrRole',
				type: (msg: HavocMessage) => msg.args.includes('channel') || msg.intialMsg.promptResponses.has('channel') ? 'channel' : 'role',
				prompt: {
					initialMsg: (msg: HavocMessage) => msg.promptResponses.has('channel')
						? 'mention the channel, or enter the ID of the channel that would like the giveaways to be created on.'
						: 'mention the role, or enter the name of the role that you would like to give access for starting, ending or rerolling giveaways.'
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

	public async run(this: HavocClient, { msg, target: { channelOrRole } }: { msg: HavocMessage; target: { channelOrRole: HavocTextChannel | Role } }) {
		const { giveaway } = await msg.guild.config;
		const type = channelOrRole instanceof Role ? 'role' : 'channel';
		await msg.guild.addConfig({ giveaway: { ...giveaway, [type]: channelOrRole.id } });
		msg.sendEmbed({ setDescription: `**${msg.author.tag}** I have updated the giveaways ${type} to ${channelOrRole} for this server.` });
	}
}
