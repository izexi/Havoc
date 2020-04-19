import Havoc from '../client/Havoc';

export default function(this: Havoc, info: string) {
  if (!info.includes('Heartbeat')) this.logger.debug(info);
}
