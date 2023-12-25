import { isAbsolute } from 'upath2';

import { PackageJson } from './types';

// Remove the package name scope if it exists
export const removeScope = (name: string) => name.replace(/^@.*\//, '');

export const safePackageName = (name: string) =>
  name
    .toLowerCase()
    .replace(/(^@.*\/)|((^[^a-zA-Z]+)|[^\w.-])|([^a-zA-Z0-9]+$)/g, '');

export const external = (id: string) =>
  !id.startsWith('.') && !isAbsolute(id);

// Taken from Create React App, react-dev-utils/clearConsole
// @see https://github.com/facebook/create-react-app/blob/master/packages/react-dev-utils/clearConsole.js
export function clearConsole() {
  process.stdout.write(
    process.platform === 'win32' ? '\x1B[2J\x1B[0f' : '\x1B[2J\x1B[3J\x1B[H'
  );
}

export function getReactVersion({
  dependencies,
  devDependencies,
}: PackageJson) {
  return (
    (dependencies?.react) ||
    (devDependencies?.react)
  );
}

export function getNodeEngineRequirement({ engines }: PackageJson) {
  return engines?.node;
}
