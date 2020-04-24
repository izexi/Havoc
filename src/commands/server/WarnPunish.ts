import Command from '../../structures/bases/Command';
import Havoc from '../../client/Havoc';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { Target } from '../../util/Targetter';
import GuildEntity from '../../structures/entities/GuildEntity';
import { getPunishments } from '../moderation/Warn';
import WarnPunishmentEntity from '../../structures/entities/WarnPunishmentEntity';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: 'Set the warn punishments for the server.',
      aliases: ['warnp', 'punishments'],
      args: [
        {
          name: 'warning amount',
          type: Target.NUMBER,
          promptOpts: {
            initial:
              'enter the amount of warnings that must be reached for this punishment',
            invalid: 'you need to enter the number of warnings, e.g: `3`'
          }
        },
        {
          required: true,
          name: 'punishment',
          example: ['mute'],
          type: message => {
            const possiblePunishment = message.arg?.toLowerCase();
            if (!possiblePunishment) return;
            if (['none', 'mute', 'kick', 'ban'].includes(possiblePunishment))
              return message.shiftArg(possiblePunishment);
          },
          promptOpts: {
            initial:
              'enter the punishment, which can be either `none`, `mute`, `kick` or `ban` (enter the according option)',
            invalid:
              'You will need to enter either `none`, `mute`, `kick` or `ban`'
          }
        },
        {
          name: 'mute duration',
          type: Target.TIME,
          promptOpts: {
            initial:
              'enter the duration for how long you would like the mute to be, e.g: `5` would be 5 minutes or `5h` would be 5 hours.',
            invalid:
              'You will need to a valid time format, e.g: `5` would be 5 minutes or `5h` would be 5 hours'
          }
        }
      ],
      requiredPerms: 'MANAGE_GUILD'
    });
  }

  async run(
    this: Havoc,
    {
      message,
      number: amount,
      fn: punishment,
      time: duration
    }: {
      message: HavocMessage;
      number: number;
      fn: 'none' | 'mute' | 'kick' | 'ban';
      time: number;
    }
  ) {
    if (punishment.startsWith('mute') && !duration) {
      const target = await message.createPrompt({
        initialMsg:
          'enter the duration for how long you would like the mute to be, e.g: `5` would be 5 minutes or `5h` would be 5 hours.',
        invalidMsg:
          'You will need to a valid time format, e.g: `5` would be 5 minutes or `5h` would be 5 hours',
        target: Target.TIME
      });
      if (!target.time) return;
      duration = target.time;
    }

    const punishments = await getPunishments(this, message);

    if (punishment === 'none') punishments.delete(amount);
    else punishments.set(amount, duration ? `mute ${duration}` : punishment);

    const guildEntity = await this.db.findOrInsert(
      GuildEntity,
      message.guild!.id
    );
    await guildEntity.warnPunishments.init();

    if (guildEntity.warnPunishments.count()) {
      guildEntity.warnPunishments.removeAll();
      await this.db.flush();
    }

    punishments.forEach((punishment, amount) => {
      const [action, time] = punishment.split(' ');
      guildEntity.warnPunishments.add(
        new WarnPunishmentEntity({
          amount,
          punishment: action,
          duration: time ? Number(time) : undefined
        })
      );
    });

    await this.db.flush();

    message.respond(
      `I have updated this server's warn punishments to, you can view them by doing \`${message.prefix}warnpunishlist\`.`
    );
  }
}
