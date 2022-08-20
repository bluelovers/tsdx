import execa from 'execa';

let cmd: InstallCommand;

export type InstallCommand = 'yarn' | 'npm' | 'yarn-tool';

export async function getInstallCmd(): Promise<InstallCommand> {
  if (cmd) {
    return cmd;
  }

  try {
    await execa('yarn-tool', ['--version']);
    cmd = 'yarn-tool';
  } catch (e) {
    try {
      await execa('yarnpkg', ['--version']);
      cmd = 'yarn';
    } catch (e) {
      cmd = 'npm';
    }
  }

  return cmd;
}
