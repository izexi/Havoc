import Command from '../../structures/bases/Command';
import Havoc from '../../client/Havoc';
import HavocMessage from '../../structures/extensions/HavocMessage';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: 'View the heartbeat/latency in ms.'
    });
  }

  async run(this: Havoc, { message }: { message: HavocMessage }) {
    message.respond({ setTitle: '🏸 Pinging...' }).then(msg => {
      msg.edit(
        message.constructEmbed({
          setTitle: '🏓 Pong!',
          setDescription: `Latency: ${msg.createdTimestamp -
            message.createdTimestamp}ms\nHeartbeat: ${~~this.ws.ping}ms`
        })
      );
    });
  }
}
