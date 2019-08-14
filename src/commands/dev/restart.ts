import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';

export default class Reload extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b0011,
			description: 'Restart me.'
		});
	}

	public async run(this: HavocClient, { msg }: { msg: HavocMessage }) {
		await msg.sendEmbed({ setDescription: '<a:Restarting:411680219636826112> Restarting...' });
		this.db.category = 'restart';
		await this.db.set('restart', msg.channel.id);
		process.exit();
	}
}
