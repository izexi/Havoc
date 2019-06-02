import Logger from '../util/Logger';
import HavocClient from '../client/Havoc';

export default function(this: HavocClient) {
	this.user!.setActivity('you', { type: 'WATCHING' });
	Logger.log(`${this.user!.tag} is ready in ${this.guilds.size} guilds!`);
	this.supportServer = this.guilds.get('406873117215031297')!;
	this.scheduler.start();
}
