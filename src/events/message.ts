import HavocMessage from '../extensions/Message';
import HavocClient from '../Havoc';

export default function(this: HavocClient, msg: HavocMessage) {
	if (!msg.prefix || msg.author!.bot || msg.webhookID) return;
	if (msg.mentionPrefix) msg.args.shift();
	const possibleCommand = msg.args.shift();
	const command = this.commands.handler.get(possibleCommand!);
	if (!command) return;
	try {
		msg.command = command;
		command.run.call(this, msg);
	} catch (err) {
		this.emit('commandError', err, msg);
	}
}
