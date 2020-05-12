import Command from '../../structures/bases/Command';
import Havoc from '../../client/Havoc';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { EMOJIS } from '../../util/CONSTANTS';

export default class extends Command {
  constructor() {
    super(__filename, {
      dm: true,
      description: 'View the heartbeat/latency in ms.',
    });
  }

  async run(this: Havoc, { message }: { message: HavocMessage }) {
    message.respond({ setTitle: `${EMOJIS.PING} Pinging...` }).then((msg) => {
      msg.edit(
        message.constructEmbed({
          setTitle: `${EMOJIS.PONG} Pong!`,
          setDescription: `Latency: ${
            msg.createdTimestamp - message.createdTimestamp
          }ms\nHeartbeat: ${~~this.ws.ping}ms`,
        })
      );
    });
  }
}
