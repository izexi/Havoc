import Havoc from '../client/Havoc';

export default function(this: Havoc, rateLimit: object) {
  this.logger.warn(JSON.stringify(rateLimit, null, 2), {
    origin: 'Havoc#on:rateLimit'
  });
}
