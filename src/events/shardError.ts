import HavocClient from '../client/Havoc';
import Logger from '../util/Logger';

export default function(this: HavocClient, error: Error, shardID: number) {
	Logger.error(`Shard ${shardID} encountered an error`, error);
}
