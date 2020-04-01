import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { Target } from '../../util/Targetter';
import * as languages from '../../assets/languages.json';
import Util from '../../util/Util';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const translate = require('@vitalets/google-translate-api');

export default class extends Command {
  constructor() {
    super(__filename, {
      description:
        'Translates the inputted text to English (by default) / optional flag language via Google Translate.',
      args: {
        type: Target.TEXT,
        required: true,
        prompt: message =>
          `'enter the text that you would like to translate with an optional language that you would like to translate to as a flag (e.g:  \`${message.prefix}t ${message.prefix}spanish hello\`).`
      },
      aliases: ['t'],
      flags: Object.entries(languages).flatMap(([language, { aliases }]) => [
        language,
        ...aliases
      ])
    });
  }

  async run({
    message,
    text,
    flags
  }: {
    message: HavocMessage;
    text: string;
    flags: { [flag: string]: undefined };
  }) {
    const to = Object.keys(flags)[0] || 'en';
    const [language, { flag }] = Object.entries(languages).find(
      ([lang, { aliases }]) => lang === to || aliases.includes(to)
    )!;

    translate(text, { to })
      .then((res: { text: string; from: { language: { iso: string } } }) => {
        message.sendEmbed(
          {
            setDescription: `:flag_${flag}: ${res.text}`,
            setFooter: [
              `Translated from ${Util.captialise(
                Object.keys(languages).find(language =>
                  (languages as {
                    [key: string]: { flag: string; aliases: string[] };
                  })[language].aliases.includes(res.from.language.iso)
                )!
              )} to ${Util.captialise(language)}`,
              'https://seeklogo.com/images/G/google-translate-logo-66F8665D22-seeklogo.com.png'
            ]
          },
          message.author.toString()
        );
      })
      .catch(() =>
        message.respond(
          `there was an error while attempting to translate your text.`
        )
      );
  }
}
