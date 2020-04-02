import { promises as fs } from 'fs';
import { join } from 'path';
import fetch from 'node-fetch';

export type MaybeArray<T> = T | T[];

export default {
  /**
   * ```
   * folder
    └── parent
        └── child
   * ``` 
   * `Promise<[__dirname/folder/child]>`
   */
  async flattenPaths(folder: string) {
    const parents = await fs.readdir(join(__dirname, '..', folder));
    const childrenPaths = parents.reduce((files, parent) => {
      const parentDir = join(__dirname, '..', folder, parent);
      files.add(
        fs
          .readdir(parentDir)
          .then(children => children.map(child => join(parentDir, child)))
      );
      return files;
    }, new Set() as Set<Promise<string[]>>);
    return Promise.all(childrenPaths).then(paths => paths.flat());
  },

  arrayify<T>(arg: T) {
    return arg ? [arg].flat() : [];
  },

  plural(str: string, n: number) {
    return str + (!n || n > 1 ? 's' : '');
  },

  captialise(str: string) {
    return str.replace(/./, letter => letter.toUpperCase());
  },

  async haste(body: string, extension = 'txt') {
    return fetch('https://hasteb.in/documents', { method: 'POST', body })
      .then(
        async res => `https://hasteb.in/${(await res.json()).key}.${extension}`
      )
      .catch(async () =>
        fetch('https://paste.nomsy.net/documents', {
          method: 'POST',
          body
        }).then(
          async res =>
            `https://paste.nomsy.net/${(await res.json()).key}.${extension}`
        )
      );
  },

  codeblock(text: string, lang = '') {
    return `\`\`\`${lang}\n${text.replace(/```/g, '`\u200b``')}\n\`\`\``;
  },

  emojiNumber(n: number) {
    return ['1⃣', '2⃣', '3⃣', '4⃣', '5⃣', '6⃣', '7⃣', '8⃣', '9⃣', '🔟'][n - 1];
  },

  randomInt(min: number, max: number) {
    return ~~(Math.random() * (max - min + 1)) + min;
  }
};
