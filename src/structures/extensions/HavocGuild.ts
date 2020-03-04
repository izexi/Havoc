import { Guild } from 'discord.js';

export default class extends Guild {
  prefix = process.env.PREFIX!;
}
