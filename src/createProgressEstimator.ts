import { ensureDir } from 'fs-extra';

import { paths } from './constants';

const progressEstimator = require('progress-estimator');

export async function createProgressEstimator() {
  await ensureDir(paths.progressEstimatorCache);
  return progressEstimator({
    // All configuration keys are optional, but it's recommended to specify a storage location.
    storagePath: paths.progressEstimatorCache,
  });
}
