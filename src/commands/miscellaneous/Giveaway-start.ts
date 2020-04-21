import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { Target } from '../../util/Targetter';
import Util from '../../util/Util';
import ms = require('ms');
import Havoc from '../../client/Havoc';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: 'Starts a giveaway with options.',
      args: [
        {
          type: Target.TIME,
          required: true,
          prompt:
            'enter the time limit for how long the giveaway should last suffix the time with `w`/`d`/`h`/`m`/`s`, e.g: `3m5s` would be 3 minutes and 5 seconds.'
        },
        {
          type: Target.NUMBER,
          required: true,
          promptOpts: {
            initial: 'enter the amount of possible winners for the giveaway.',
            invalid:
              'You need to a enter a valid number. `5` would allow the giveaway to have 5 winners for example'
          }
        },
        {
          type: Target.TEXT,
          required: true,
          promptOpts: {
            initial: 'enter the prize that of the giveaway.',
            invalid:
              'You need to a enter the prize of the giveaway. `Nothing` would start a giveaway that has nothing as a prize for example.'
          }
        }
      ],
      sub: true,
      requiredPerms: 'MANAGE_GUILD'
    });
  }

  async run(
    this: Havoc,
    {
      message,
      time,
      number: winners,
      text: prize
    }: {
      message: HavocMessage;
      time: number;
      number: number;
      text: string;
    }
  ) {
    const giveawayChannel = await message.findConfigChannel('giveaway');
    if (!giveawayChannel) return;

    const embed = message.constructEmbed({
      setTitle: prize,
      setDescription: `React with 🎉 to enter!\nTime remaining: **${ms(time, {
        long: true
      })}**`,
      setFooter: `${winners || 1} ${Util.plural(
        'Winner',
        Number(winners) || 1
      )} | Ends at: `,
      setColor: 'GREEN'
    });
    if (time > 60000) embed.setTimestamp(Date.now() + time);

    const giveawayMsg = (await giveawayChannel.send(
      '🎉 **GIVEAWAY** 🎉',
      embed
    )) as HavocMessage;
    if (!giveawayMsg) return;

    await Promise.all([
      giveawayMsg.safeReact('🎉'),
      giveawayMsg.edit(
        giveawayMsg.embeds[0].setFooter(
          `${winners || 1} ${Util.plural(
            'Winner',
            Number(winners) || 1
          )} | Giveaway ID: ${giveawayMsg.id} | Ends at: `
        )
      )
    ]);

    await this.schedules.giveaway.start(message.guild!.id, {
      end: new Date(Date.now() + time),
      channel: giveawayMsg.channel.id,
      message: giveawayMsg.id,
      winners
    });
    message.respond(`I have started the [giveaway](${giveawayMsg.url}).`);
  }
}
