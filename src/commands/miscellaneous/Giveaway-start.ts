import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { Target } from '../../util/Targetter';
import Util from '../../util/Util';
import ms = require('ms');
import Havoc from '../../client/Havoc';
import {
  PROMPT_INITIAL,
  PROMPT_INVALD,
  PROMPT_ENTER
} from '../../util/Constants';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: 'Starts a giveaway with options.',
      aliases: ['g-start'],
      args: [
        {
          name: 'duration',
          type: Target.TIME,
          required: true,
          prompt: PROMPT_INITIAL[Target.TIME]('giveaway')
        },
        {
          name: 'amount of winners',
          type: Target.NUMBER,
          required: true,
          promptOpts: {
            initial: PROMPT_INITIAL[Target.NUMBER](
              'winners',
              'allow to win the giveaway'
            ),
            invalid: PROMPT_INVALD(
              'a valid number. `5` would allow the giveaway to have 5 winners for example'
            )
          }
        },
        {
          name: 'prize',
          type: Target.TEXT,
          required: true,
          promptOpts: {
            initial: PROMPT_ENTER('the prize that of the giveaway'),
            invalid: PROMPT_INVALD(
              'the prize of the giveaway. `Nothing` would start a giveaway that has nothing as a prize for example'
            )
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
