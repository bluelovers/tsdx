import { config, test } from 'shelljs';

import { execWithCache } from '../utils/shell';
import { checkCompileFiles, setupStageWithFixture, teardownStage } from '../utils/fixture';

config.silent = false;

const testDir = 'e2e';
const fixtureName = 'build-invalid';
const stageName = `stage-${testDir}-${fixtureName}`;

describe('tsdx build :: invalid build', () =>
{
	beforeAll(() =>
	{
		teardownStage(stageName);
		setupStageWithFixture(testDir, stageName, fixtureName);
	});

	it.skip('should fail gracefully with exit code 1 when build failed', () =>
	{
		const output = execWithCache('node ../dist/index.js build');
		expect(output.code).toBe(1);
	});

	it('should only transpile and not type check', () =>
	{
		const output = execWithCache('node ../dist/index.js build --transpileOnly');

		checkCompileFiles();

		expect(output.code).toBe(0);
	});

	afterAll(() =>
	{
		teardownStage(stageName);
	});
});
