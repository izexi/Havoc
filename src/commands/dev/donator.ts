import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';

export default class Donator extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b1011,
			description: 'Add a donator.',
			args: [{
				type: 'id',
				prompt: { initialMsg: 'enter the donator\'s id.' }
			},
			{
				key: 'tier',
				type: 'number',
				prompt: { initialMsg: 'enter the tier number.' }
			}]
		});
	}

	public async run(this: HavocClient, { msg, target: { id, tier } }: { msg: HavocMessage; target: { id: string; tier: number } }) {
		const user = await this.users.fetch(id).catch(() => null);
		if (!user) {
			return msg.sendEmbed({ setDescription: `**${msg.author.tag}** \`${id}\` is an invalid ID` });
		}
		this.db.category = 'donators';
		const donators = await this.db.get(`donators${tier}`) || [];
		await this.db.set(`donators${tier}`, [...donators, id]);
		this.donators.get(tier.toString())!.add(id);
		msg.sendEmbed({ setDescription: `\`${user.tag}\` has been added to the donator list.` });
		this.supportServer.members.fetch(id)
			.then(async member => member.roles.add('471422129825382444'))
			.catch(() => null);
	}
}
