import { cd, exec, config } from 'shelljs';
import { join } from 'path';
import { __ROOT } from './__root';

const bin = join(__ROOT, 'dist/index');
const target = join('G:\\Users\\The Project\\temp\\tsdx-0001');

config.verbose = true;

cd(target);
exec(`node "${bin}" build`);
