export default {
  prefix(clientID: string, prefix: string) {
    return new RegExp(
      `^(<@!?${clientID}>|${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\s*`
    );
  },
  mentionPrefix(clientID: string) {
    return new RegExp(`^<@!?${clientID}>$`);
  },
  id: /\d{17,19}/g,
  user: {
    tag: /.{2,32}(#)\d{4}/g,
    username: /.{2,32}/g
  },
  emoji: /<(?::a)?:\w{2,32}:(\d{17,19})>/
};
