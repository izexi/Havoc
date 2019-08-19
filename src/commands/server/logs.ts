import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';

export default class Logs extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b1000,
			description: 'Configure the logs for the server.',
			args: [{
				key: 'subCommand',
				type: (msg: HavocMessage) => {
					const option = msg.arg;
					if (['enable', 'update', 'disable', 'config'].includes(option)) return option;
				},
				prompt: {
					initialMsg: 'would you like to `enable`, `update`, `config` or `disable` logs for this server? (enter the according option)',
					invalidResponseMsg: 'You will need to enter either `enable`, `update`, `config` or `disable`'
				}
			}],
			userPerms: { flags: 'MANAGE_GUILD' },
			usage: [
				'[enable | updated] [{channel}]',
				'[config] [view]',
				'[config] [enable | disable] [event | number]',
				'[disable]'
			],
			examples: {
				'enable {channel}': 'enables logs in the server for the corresponding channel',
				'config disable chanel updates': 'disables logs for channel updates on the server',
				'config enable chanel updates': 'enables logs for channel updates on the server',
				'disable': 'disables logs in the server'
			}
		});
	}

	public async run(this: HavocClient, { msg, target: { subCommand } }: { msg: HavocMessage; target: { subCommand: string } }) {
		this.commands.handler.handle(msg, this.commands.get(`logs-${subCommand.replace(/update/i, 'enable')}`)!);
	}
}
