import { InstallCommand } from './getInstallCmd';

export function getInstallArgs(
  cmd: InstallCommand,
  packages: string[]
) {
  switch (cmd) {
    case 'npm':
      return ['install', ...packages, '--save-dev'];
    case 'yarn':
    case 'yarn-tool':
      return ['add', ...packages, '--dev'];
  }
}
