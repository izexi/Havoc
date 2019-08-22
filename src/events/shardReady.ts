import HavocClient from '../client/Havoc';
import Logger from '../util/Logger';

export default function(this: HavocClient, id: number) {
	Logger.info(`Shard ${id} is ready`);
}
