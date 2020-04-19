import { createLogger, format, transports } from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

export default createLogger({
  format: format.combine(
    format.timestamp({ format: 'DD/MM/YYYY HH:mm:ss' }),
    format.errors({ stack: true }),
    format.printf(
      ({ timestamp, level, origin, message }) =>
        `${timestamp} | [${level} ~ ${origin}]: ${message}`
    )
  ),
  transports: [
    new transports.Console({
      level: 'info',
      format: format.colorize({ level: true })
    }),
    new transports.File({
      level: 'error',
      filename: 'error.log',
      dirname: 'logs',
      maxFiles: 7,
      maxsize: 20 * 1024 * 1024
    }),
    new DailyRotateFile({
      level: 'debug',
      format: format.combine(format.timestamp(), format.json()),
      dirname: 'logs',
      datePattern: 'DD-MM-YYYY',
      filename: '%DATE%.debug.log',
      maxFiles: '7d',
      maxSize: '20m'
    }).on('rotate', (oldFileName, newFilename) =>
      // eslint-disable-next-line no-console
      console.log(`Rotating logs | ${oldFileName} => ${newFilename}`)
    )
  ]
});
