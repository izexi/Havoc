import { promises as fs } from 'fs';
import { join } from 'path';
import fetch from 'node-fetch';
import { SMALL_CAPS } from './CONSTANTS';

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
          .then((children) => children.map((child) => join(parentDir, child)))
      );
      return files;
    }, new Set() as Set<Promise<string[]>>);
    return Promise.all(childrenPaths).then((paths) => paths.flat());
  },

  arrayify<T>(arg: T) {
    return typeof arg === 'undefined' ? [] : [arg].flat();
  },

  plural(str: string, n: number) {
    return str + (!n || n > 1 ? 's' : '');
  },

  captialise(str: string) {
    return str.replace(/./, (letter) => letter.toUpperCase());
  },

  async haste(body: string, extension = 'txt') {
    return fetch('https://hasteb.in/documents', { method: 'POST', body })
      .then(
        async (res) =>
          `https://hasteb.in/${(await res.json()).key}.${extension}`
      )
      .catch(async () =>
        fetch('https://paste.nomsy.net/documents', {
          method: 'POST',
          body,
        }).then(
          async (res) =>
            `https://paste.nomsy.net/${(await res.json()).key}.${extension}`
        )
      );
  },

  codeblock(text: string, lang = '') {
    return `\`\`\`${lang}\n${text.replace(/```/g, '`\u200b``')}\n\`\`\``;
  },

  randomInt(min: number, max: number) {
    return ~~(Math.random() * (max - min + 1)) + min;
  },

  normalizePermFlag(perm: string) {
    return perm
      .toLowerCase()
      .replace(/(^|"|_)(\S)/g, (s) => s.toUpperCase())
      .replace(/_/g, ' ')
      .replace(/Guild/g, 'Server')
      .replace(/Use Vad/g, 'Use Voice Acitvity');
  },

  inObj(flags: { [key: string]: undefined }, ...flag: string[]) {
    return flag.some((f) => f in flags);
  },

  stripBlankLines(str: string) {
    // https://github.com/IonicaBizau/remove-blank-lines/blob/master/lib/index.js#L9
    return str.replace(/(^[ \t]*\n)/gm, '');
  },

  ordinal(n: number) {
    // https://v8.dev/features/intl-pluralrules#ordinal-numbers
    const pr = new Intl.PluralRules('en', {
      type: 'ordinal',
    });
    const suffixes = new Map([
      ['one', 'st'],
      ['two', 'nd'],
      ['few', 'rd'],
      ['other', 'th'],
    ]);
    const rule = pr.select(n);
    const suffix = suffixes.get(rule);
    return `${n}${suffix}`;
  },

  auditClean(reason = '') {
    return reason.replace(/`/g, '');
  },

  truthyObjMerge<T>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    source: { [key in keyof T]?: any },
    target: T,
    ...props: (keyof T)[]
  ) {
    props
      .filter((prop) => target[prop])
      .forEach((prop) => (source[prop] = target[prop]));
  },

  smallCaps(str: string) {
    return str.replace(
      new RegExp(Object.keys(SMALL_CAPS).join('|'), 'gi'),
      (letter) => SMALL_CAPS[letter] || letter
    );
  },

  randomArrEl<T>(arr: T[]) {
    return arr[this.randomInt(0, arr.length - 1)];
  },

  lastArrEl<T>(arr: T[]) {
    return arr[arr.length - 1];
  },

  spliceDupes<T>(arr: T[]) {
    arr.forEach((n, i) => {
      if (arr.indexOf(n) !== i) {
        arr.splice(i, 1);
      }
    });
    return arr;
  },
};
