//import { PackageJson } from 'type-fest';
import PackageJson from '@ts-type/package-dts/package-json';

interface Template {
  dependencies: string[];
  name: string;
  packageJson: PackageJson;
}
