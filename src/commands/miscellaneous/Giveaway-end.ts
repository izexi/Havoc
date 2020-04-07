import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import GiveawayEntity from '../../structures/entities/GiveawayEntity';
import Havoc from '../../client/Havoc';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: 'Ends a giveaway.',
      args: {
        type: async message => {
          const guild = await message.client.db.guildRepo.findOne(
            {
              giveaways: {
                message: message.arg
              }
            },
            { populate: ['giveaways'] }
          );
          const giveaways = await guild?.giveaways.init();
          return giveaways?.getItems().find(g => g.message === message.arg);
        },
        required: true,
        promptOpts: {
          initial:
            "enter the ID of the giveaway that you would like to end right now which you can find on the footer of the giveaways's embed",
          invalid:
            'You have entered an invalid Giveaway ID https://i.imgur.com/jZpv4Fk.png'
        }
      },
      sub: true,
      requiredPerms: 'MANAGE_GUILD'
    });
  }

  async run(
    this: Havoc,
    {
      message,
      fn: giveaway
    }: {
      message: HavocMessage;
      fn: GiveawayEntity;
    }
  ) {
    await this.schedules.giveaway.end(giveaway);
    message.respond(
      `I have ended the [giveaway](https://discordapp.com/channels/${
        message.guild!.id
      }/${giveaway.channel}/${giveaway.message}).`
    );
  }
}
