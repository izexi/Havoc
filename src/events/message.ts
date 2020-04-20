import HavocMessage from '../structures/extensions/HavocMessage';
import Havoc from '../client/Havoc';

export default function(this: Havoc, message: HavocMessage) {
  this.commandHandler.handle(message);
}
