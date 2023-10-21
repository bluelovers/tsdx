// this file contains helper utils for working with shell.js functions
import { config, exec, ExecOptions, grep as _grep, ShellReturnValue, test } from 'shelljs';
import { inCI } from './env';
import { ITSValueOrArrayMaybeReadonly } from 'ts-type';
import { join } from 'upath2';
import { __ROOT } from '../__root';

config.silent = true;
config.verbose = false;

// simple shell.exec "cache" that doesn't re-run the same command twice in a row
let prevCommand = '';
let prevCommandOutput = {} as ShellReturnValue;

export function execWithCache(
  command: string,
  { noCache = false } = {} as IOptionsExecBinWithCache
): ShellReturnValue {
  // return the old output
  if (!noCache && prevCommand === command) return prevCommandOutput;

  const output = exec(command);

  // reset if command is not to be cached
  if (noCache) {
    prevCommand = '';
    prevCommandOutput = {} as ShellReturnValue;
  } else {
    prevCommand = command;
    prevCommandOutput = output;
  }

  return output;
}

// shell.js grep wrapper returns true if pattern has matches in file
export function grep(pattern: RegExp, fileName: string[]): boolean {
  const output = _grep(pattern, fileName);
  // output.code is always 0 regardless of matched/unmatched patterns
  // so need to test output.stdout
  // https://github.com/jaredpalmer/tsdx/pull/525#discussion_r395571779
  return Boolean(output.stdout.match(pattern));
}

export function shellSilentInCi()
{
  config.silent = inCI;
}

export function execBinCommand(argv: ITSValueOrArrayMaybeReadonly<string>)
{
  return `node "${join(__ROOT, 'dist/index.js')}" ${[argv].flat().join(' ')}` as const
}

export function execBin(argv: ITSValueOrArrayMaybeReadonly<string>, options?: ExecOptions & {
  async?: false | undefined
})
{
  const cmd = execBinCommand(argv);
  console.debug(cmd);
  const output = exec(cmd, options);
  return output
}

export interface IOptionsExecBinWithCache
{
  /**
   * @default false
   */
  noCache: boolean;
}

export function execBinWithCache(argv: ITSValueOrArrayMaybeReadonly<string>, options?: IOptionsExecBinWithCache)
{
  const cmd = execBinCommand(argv);
  console.debug(cmd);
  const output = execWithCache(cmd, options);
  return output
}

export function shellTestFile(target: string)
{
  return test('-f', target)
}
