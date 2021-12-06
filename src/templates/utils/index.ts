import { Template } from '../template';

interface ProjectArgs {
  name: string;
  author: string;
}
export const composePackageJson = (template: Template) => ({
  name,
  author,
}: ProjectArgs) => {
  return {
    ...template.packageJson,
    name,
    author,
    module: `dist/${name}.esm.mjs`,
    'size-limit': [
      {
        path: `dist/${name}.cjs.production.min.js`,
        limit: '10 KB',
      },
      {
        path: `dist/${name}.esm.mjs`,
        limit: '10 KB',
      },
    ],
  };
};
