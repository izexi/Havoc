import HavocClient from '../client/Havoc';
import Logger from '../util/Logger';

export default function(this: HavocClient, id: number, replayedEvents: number) {
	Logger.info(`Shard ${id} is resuming (replaying ${replayedEvents} events)`);
}
