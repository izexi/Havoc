import Command from '../../structures/bases/Command';
import Havoc from '../../client/Havoc';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { getPunishments } from '../moderation/Warn';
import Util from '../../util';
import ms = require('ms');

export default class extends Command {
  constructor() {
    super(__filename, {
      description: 'View the current punishments for warns on the server.',
      aliases: ['warnplist', 'punishmentlist'],
      requiredPerms: 'MANAGE_GUILD'
    });
  }

  async run(this: Havoc, { message }: { message: HavocMessage }) {
    const punishments = await getPunishments(this, message);

    message.respond({
      setDescription: Util.codeblock(
        [...punishments.entries()]
          .sort(([prev], [curr]) => prev - curr)
          .map(([amount, punishment]) => {
            const [action, time] = punishment.split(' ');
            return `${amount} => ${
              action === 'mute'
                ? `Mute for ${ms(Number(time), {
                    long: true
                  })}`
                : Util.captialise(punishment)
            }\n`;
          })
          .join('\n')
      )
    });
  }
}
