import { _makeAppPathsCore } from './utils/paths';

export const {
  resolveApp,
  relativeApp,
  paths
} = _makeAppPathsCore(process.cwd());
