import { Template } from './template';

import basicTemplate from './basic';
//import { PackageJson } from 'type-fest';
import PackageJson from '@ts-type/package-dts/package-json';

const reactTemplate: Template = {
  name: 'react',
  dependencies: [
    ...basicTemplate.dependencies,
    '@types/react',
    '@types/react-dom',
    'react',
    'react-dom',
  ],
  packageJson: {
    ...basicTemplate.packageJson,
    peerDependencies: {
      ...basicTemplate.packageJson.peerDependencies,
      react: '>=16',
    },
    scripts: {
      ...basicTemplate.packageJson.scripts,
      test: 'tsdx test --passWithNoTests',
    } as PackageJson['scripts'],
  },
};

export default reactTemplate;
