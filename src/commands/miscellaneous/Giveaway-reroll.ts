import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import Havoc from '../../client/Havoc';
import { Target } from '../../util/targetter';
import { MessageEmbed } from 'discord.js';
import {
  PROMPT_INITIAL,
  PROMPT_INVALD,
  PROMPT_ENTER,
  NOOP,
  EMOJIS
} from '../../util/CONSTANTS';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: 'Rerolls a giveaway.',
      aliases: ['g-reroll'],
      args: [
        {
          name: 'ID',
          example: ['581073145482575875'],
          type: async message => {
            const giveawayMsg = await message
              .findConfigChannel('giveaway')
              .then(channel => channel?.messages.fetch(message.arg!))
              .catch(NOOP);
            return message.shiftArg(giveawayMsg);
          },
          required: true,
          promptOpts: {
            initial: PROMPT_ENTER(
              "the ID of the giveaway that you would like to end right now which you can find on the footer of the giveaways's embed"
            ),
            invalid:
              'You have entered an invalid Giveaway ID https://i.imgur.com/jZpv4Fk.png'
          }
        },
        {
          name: 'amount of winners',
          type: Target.NUMBER,
          required: true,
          promptOpts: {
            initial: PROMPT_INITIAL[Target.NUMBER]('winners', 'reroll'),
            invalid: PROMPT_INVALD(
              'a valid number. `5` would reroll 5 new winners on the giveaway for example'
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
      fn: giveawayMsg,
      number: winner
    }: {
      message: HavocMessage;
      fn: HavocMessage;
      number: number;
    }
  ) {
    const reaction = giveawayMsg.reactions.cache.get(EMOJIS.GIVEAWAY);
    if (!reaction)
      return message.respond(
        `a new winner could not be determined as there aren't any ${EMOJIS.GIVEAWAY} reactions on the [giveaway](${giveawayMsg.url}).`
      );

    const newWinners = await reaction.users.fetch().then(users =>
      users
        .filter(user => user.id !== this.user!.id)
        .random(winner)
        .filter(user => user)
    );
    if (!newWinners.length)
      return message.respond(
        `a new winner could not be determined as there aren't enough ${EMOJIS.GIVEAWAY} reactions on the [giveaway](${giveawayMsg.url}).`
      );

    await giveawayMsg
      .sendEmbed(
        {
          setDescription: `${
            EMOJIS.GIVEAWAY
          } Congratulations **${newWinners
            .map(u => u.tag)
            .join(', ')}**! You are the new winner of the [giveaway](${
            giveawayMsg.url
          }) for ${giveawayMsg.embeds[0].title} ${EMOJIS.GIVEAWAY}`,
          setColor: 'GOLD'
        },
        newWinners.map(u => u.toString()).join(', ')
      )
      .then(() =>
        Promise.all(
          newWinners.map(async u =>
            u
              .send(
                new MessageEmbed()
                  .setDescription(
                    `${EMOJIS.GIVEAWAY} Congratulations **${u.tag}**! You are the new winner of the [giveaway](${giveawayMsg.url}) for ${giveawayMsg.embeds[0].title} ${EMOJIS.GIVEAWAY}`
                  )
                  .setColor('GOLD')
              )
              .catch(NOOP)
          )
        )
      );

    return message.respond(
      `a new winner has been rerolled on the [giveaway](${giveawayMsg.url}).`
    );
  }
}
