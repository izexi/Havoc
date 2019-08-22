import HavocClient from '../client/Havoc';
import Logger from '../util/Logger';

export default function(this: HavocClient, event: CloseEvent, id: number) {
	Logger.status(`Shard ${id} disconnected (${event.reason})`);
}
