// TODO: Move random strings here

import { Target, ExcludedOther } from './targetter';
import Util from '.';

export enum STATUS_ICONS {
  READY = 'https://www.dictionary.com/e/wp-content/uploads/2016/01/paris-green-color-paint-code-swatch-chart-rgb-html-hex.png',
  DISCONNECTED = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Red.svg/240px-Red.svg.png',
  ERROR = 'https://www.publicdomainpictures.net/pictures/30000/velka/dark-red-background.jpg',
  RECONNECTING = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/ICS_Quebec.svg/1200px-ICS_Quebec.svg.png',
  RESUMED = 'https://www.tileflair.co.uk/images/sized/images/products/carnaby-yellow/101115/Carnaby-Yellow-180x120mm-RTCRY6_d1974737e8129c7bb88892b7409c39bb.jpg'
}

export enum MAX_LIMITS {
  JSON_EMBED = 2036,
  POLL_OPTIONS = 10,
  EMOJI_NAME = 32,
  EMOJI_SIZE = 256,
  DELETE_ROLE_EMBED = 1700,
  PLAY_URL = 32,
  EMBED_DESCRIPTION = 2048
}

export enum MIN_LIMITS {
  EMOJI_NAME = 2,
  LOGS_CONFIG_OPTION = 0,
  MESSAGE_DELETE_CONTENT = 1800,
  MESSAGE_UPDATE_CONTENT = 900
}

export const SMALL_CAPS: { [key: string]: string } = {
  a: 'ᴀ',
  b: 'ʙ',
  c: 'ᴄ',
  d: 'ᴅ',
  e: 'ᴇ',
  f: 'ғ',
  g: 'ɢ',
  h: 'ʜ',
  i: 'ɪ',
  j: 'ᴊ',
  k: 'ᴋ',
  l: 'ʟ',
  m: 'ᴍ',
  n: 'ɴ',
  o: 'ᴏ',
  p: 'ᴘ',
  q: 'ǫ',
  r: 'ʀ',
  s: 's',
  t: 'ᴛ',
  u: 'ᴜ',
  v: 'ᴠ',
  w: 'ᴡ',
  x: 'x',
  y: 'ʏ',
  z: 'ᴢ'
};

export const CATEGORY_EMOJIS: { [key: string]: string } = {
  emojis: '<:POGGIES:542850548043612190>',
  fun: '<:fun:407988457772810241>',
  miscellaneous: '<:miscellaneous:404688801903017984>',
  moderation: '<:moderation:407990341157912587>',
  server: '🛠',
  donators: '💸',
  music: '🎶',
  image: '🖼'
};

export const MODLOGS_COLOUR: { [key: string]: string } = {
  warn: 'YELLOW',
  clearwarnings: 'WHITE',
  mute: 'GOLD',
  kick: 'ORANGE',
  softban: 'DARK_ORANGE',
  ban: 'RED',
  unban: 'GREEN',
  unmute: 'GREEN'
};

export const EXAMPLE_ARG: {
  [key in ExcludedOther]: string[];
} = {
  [Target.CHANNEL]: ['#channel', 'channel', '406873117215031299'],
  [Target.EMOJI]: ['<:POGGIES:542850548043612190>'],
  [Target.MEMBER]: ['@Havoc', 'havoc', '191615925336670208'],
  [Target.NUMBER]: ['1', '2', '3'],
  [Target.ROLE]: ['@Role', 'role', '406904075112677377'],
  [Target.TEXT]: ['some text'],
  [Target.TIME]: ['5', '5m', '2h5m'],
  [Target.USER]: ['@Havoc', 'havoc', '191615925336670208']
};

export const PROMPT_INITIAL = {
  [Target.CHANNEL]: (action: string) =>
    `mention the channel, or enter the name / ID of the channel that would like ${action}.`,
  [Target.USER]: (action: string) =>
    `mention the user, or enter the tag / ID of who${action}.`,
  [Target.MEMBER]: (action: string) =>
    `mention the member / enter the member's ID, tag, nickname or username of who ${action}.`,
  [Target.ROLE]: (action: string) =>
    `mention the role, or enter the role's name / ID that you would like to ${action}.`,
  [Target.TEXT]: (action: string) =>
    `enter the text that you would like to ${action}.`,
  [Target.EMOJI]: (action: string) =>
    `enter the emoji that you would like to ${action}.`,
  [Target.NUMBER]: (entity: string, action: string) =>
    `enter the amount of ${entity} that you would like to ${action}.`,
  [Target.TIME]: (action: string) =>
    `enter the duration for how long you would like the ${action} to last, e.g: \`5\` would be 5 minutes or \`5h\` would be 5 hours.`,
  [Target.OPTION]: (options: string[], action: string) =>
    `would you like to ${options
      .slice(0, -1)
      .map(opt => `\`${opt}\``)
      .join(', ')} or \`${Util.lastArrEl(
      options
    )}\` the ${action}? (enter the according option)`
};

export const PROMPT_ENTER = (action: string) => `enter ${action}.`;
export const PROMPT_INVALD = (action: string) => `you need to enter ${action}.`;

export const SECONDS = (seconds: number) => seconds * 1000;
export const MINUTES = (minutes: number) => minutes * 60000;
export const HOURS = (hours: number) => hours * 3600000;
export const DAYS = (days: number) => days * 86400000;
export const WEEKS = (weeks: number) => weeks * 604800000;

export const MEGABYTES = (bytes: number) => bytes / 1048576;

export const PERCENTAGE = (from: number, base: number) => (from / base) * 100;
