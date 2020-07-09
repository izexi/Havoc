import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { Target } from '../../util/targetter';
import { PROMPT_INVALD, PROMPT_ENTER } from '../../util/CONSTANTS';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: 'Speaks the inputted text in a voice channel (TTS).',
      aliases: ['speak', 'say'],
      args: {
        type: Target.TEXT,
        required: true,
        promptOpts: {
          initial: PROMPT_ENTER(
            'the text you would like to be used in the TTS'
          ),
          invalid: PROMPT_INVALD('the text to TTS'),
        },
      },
    });
  }

  async run({ message, text }: { message: HavocMessage; text: string }) {
    if (!message.member!.voice.channel)
      return message.respond(
        `you need to be in a voice channel to use this command.`
      );

    const connection = await message.member!.voice.channel.join();
    connection
      .play(
        `https://api.streamelements.com/kappa/v2/speech?voice=Brian&text=${text}`
      )
      .on('finish', () => message.guild!.voice?.channel?.leave());
  }
}
