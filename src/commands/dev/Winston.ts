import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { promises as fs } from 'fs';
import { join } from 'path';
import Util from '../../util';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: 'View store winston logs.',
      dm: true,
      flags: ['filter']
    });
  }

  async run({
    message,
    flags
  }: {
    message: HavocMessage;
    flags: { filter?: string };
  }) {
    const logPath = join(__dirname, '../../..', 'logs');
    const logFiles = await fs.readdir(logPath);

    const parseDate = (date: string) => {
      const [day, month, year] = date.split('-');
      return new Date(`${month}/${day}/${year.split('.')[0]}`).getTime();
    };
    const recentLog = logFiles
      .filter(logFile => logFile.includes('debug'))
      .reduce((recent, file) =>
        parseDate(file) > parseDate(recent) ? file : recent
      );
    const log: {
      timestamp: string;
      level: string;
      message: string;
    }[] = await fs
      .readFile(join(logPath, recentLog), {
        encoding: 'utf8'
      })
      .then(data => {
        const parsed = data
          .split('\n')
          .slice(0, -1)
          .map(d => JSON.parse(d));
        return flags.filter
          ? parsed.filter(({ level }) => level === flags.filter)
          : parsed;
      });

    const formattedLogs = log
      .map(
        ({ timestamp, level, message }) =>
          `[${timestamp}] :: ${level}
        ${message}`
      )
      .reverse()
      .join('\n\n')
      .match(/[\s\S]{1,2048}/g)!
      .map(logs => Util.codeblock(logs, 'asciidoc'))
      .slice(-10);

    message.paginate({
      title: `Winston logs (\`${recentLog}\`)`,
      descriptions: formattedLogs,
      maxPerPage: 1
    });
  }
}
