import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { Target } from '../../util/targetter';
import Havoc from '../../client/Havoc';
import Util from '../../util';
import HavocUser from '../../structures/extensions/HavocUser';
import {
  PROMPT_INITIAL,
  PROMPT_INVALD,
  PROMPT_ENTER
} from '../../util/CONSTANTS';

export default class extends Command {
  constructor() {
    super(__filename, {
      description:
        'Removes all warns or a certain warn from the inputted member.',
      aliases: ['warnclear', 'warnc', 'clearwarnings'],
      args: [
        {
          required: true,
          type: Target.USER,
          prompt: PROMPT_INITIAL[Target.USER](
            ' you would like to clear warnings from'
          )
        },
        {
          type: Target.NUMBER,
          promptOpts: {
            initial: PROMPT_ENTER(
              'which of the warnings you would like to clear'
            ),
            invalid: PROMPT_INVALD(
              'the number of the warn that you would like to clear (e.g: enter `2` to clear the second warning)'
            )
          }
        }
      ],
      requiredPerms: ['MANAGE_ROLES', 'KICK_MEMBERS', 'BAN_MEMBERS']
    });
  }

  async run(
    this: Havoc,
    {
      message,
      user,
      number: index
    }: {
      message: HavocMessage;
      user: HavocUser;
      number: number;
    }
  ) {
    if (user.id === message.author.id) {
      await message.safeReact('463993771961483264');
      return message.channel.send('<:WaitWhat:463993771961483264>');
    }
    if (user.id === this.user!.id) {
      await message.safeReact('😢');
      return message.channel.send('😢');
    }

    const member = await message.guild!.members.fetch(user).catch(() => null);
    const response = member ? message.member.can('unwarn', member) : null;
    if (response) {
      await message.safeReact('⛔');
      return message.respond(response);
    }

    const guild = await this.db.guildRepo.findOne(
      { id: message.guild!.id, warns: { id: user.id } },
      { populate: ['warns'] }
    );
    const warns = guild?.warns.getItems().find(({ id }) => id === user.id);
    if (!warns)
      return message.respond(
        `\`${user.tag}\` doesn't have any warnings in this server.`
      );

    if (index) {
      const i = index - 1;
      const warn = warns.history[i];
      if (!warn)
        return message.respond(
          `\`${index}\` is an invalid warn, valid warns are from \`1\` to \`${warns.history.length}\`.`
        );
      warns.history.splice(i, 1);
      await this.db.flush();
      return message.respond(
        `I have cleared the ${Util.ordinal(index)} warning from \`${
          user.tag
        }\`.`
      );
    }

    const amount = warns.history.length;
    await guild!.warns.init();
    guild!.warns.remove(warns);
    await this.db.flush();
    message.respond(
      `I have cleared the ${amount} ${Util.plural('warning', amount)} from \`${
        user.tag
      }\`.`
    );
  }
}
