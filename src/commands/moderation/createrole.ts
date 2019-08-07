import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';

export default class AddRole extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b1000,
			description: 'Adds the inputted role to a member.',
			aliases: new Set(['cr']),
			args: [{
				type: 'string',
				key: 'name',
				prompt: { initialMsg: 'enter the name that you would like to name the new role' }
			}],
			userPerms: { flags: 'MANAGE_ROLES' }
		});
	}

	public async run(this: HavocClient, { msg, target: { name } }: { msg: HavocMessage; target: { name: string } }) {
		// eslint-disable-next-line promise/catch-or-return
		msg.guild.roles.create({
			data: { name },
			reason: `Created By ${msg.author.tag}`
		}).then(async () => msg.sendEmbed({ setDescription: `**${msg.author.tag}** I have created a new role named \`${name}\`.` }));
	}
}
