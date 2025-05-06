import * as path from 'path';

// generic mock for assets
export function process(src: any, filename: string, config: any, options: any) {
  return 'module.exports = ' + JSON.stringify(path.basename(filename)) + ';';
}
