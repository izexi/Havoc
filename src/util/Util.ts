import { promises as fs } from 'fs';
import { join } from 'path';

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

  arrayify<T>(arg: T): T[] {
    return Array.isArray(arg) ? arg : [arg];
  }
};
