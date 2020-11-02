import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { Target } from '../../util/targetter';
import { PROMPT_INVALD, PROMPT_ENTER } from '../../util/CONSTANTS';
import fetch from 'node-fetch';

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
    const voiceChannel = message.member!.voice.channel;
    if (!voiceChannel)
      return message.respond(
        'you need to be in a voice channel to use this command.'
      );

    if (!voiceChannel.joinable || !voiceChannel.speakable)
      return message.respond(
        `I do not have permissions to connect or speak in \`${voiceChannel.name}\`.`
      );

    const connection = await voiceChannel.join();
    const { speak_url } = await fetch(
      'https://us-central1-sunlit-context-217400.cloudfunctions.net/streamlabs-tts',
      {
        headers: {
          accept: 'application/json, text/plain, */*',
          'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
          'content-type': 'application/json;charset=UTF-8',
          'sec-ch-ua':
            '"Chromium";v="86", "\\"Not\\\\A;Brand";v="99", "Google Chrome";v="86"',
          'sec-ch-ua-mobile': '?0',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'cross-site',
        },
        body: JSON.stringify({ text, voice: 'Brian' }),
        method: 'POST',
      }
    )
      .then(async (res) => (await res.json()) || {})
      .catch(() => ({}));

    if (!speak_url)
      return message.respond(
        "I wasn't able to retrieve the TTS audio to play."
      );

    connection
      .play(speak_url)
      .on('finish', () => message.guild!.voice?.channel?.leave());
  }
}
