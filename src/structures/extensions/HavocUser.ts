import { User } from 'discord.js';

export default class extends User {
  pfp = super.displayAvatarURL();
}
