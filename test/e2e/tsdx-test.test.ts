//@noUnusedParameters:false
/// <reference types="jest" />
/// <reference types="node" />
/// <reference types="expect" />

import { basename, extname } from 'path';
import { checkCompileFiles, setupStageWithFixture, teardownStage } from '../utils/fixture';
import { execBinWithCache, shellSilentInCi } from '../utils/shell';

shellSilentInCi();

const testDir = 'e2e';
const fixtureName = 'build-default';
// create a second version of build-default's stage for concurrent testing
const stageName = `stage-${testDir}-${fixtureName}`;

describe('tsdx test', () =>
{
	beforeAll(() =>
	{
		teardownStage(stageName);
		setupStageWithFixture(testDir, stageName, fixtureName);
	});

	it("test", () =>
	{
		const output = execBinWithCache('test');

		expect(output.code).toBe(0);
	});

	afterAll(() =>
	{
		teardownStage(stageName);
	});
})
