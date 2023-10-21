import { execBinWithCache, shellSilentInCi } from '../utils/shell';
import { checkCompileFiles, setupStageWithFixture, teardownStage } from '../utils/fixture';

shellSilentInCi();

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
		const output = execBinWithCache('build');
		expect(output.code).toBe(1);
	});

	it('should only transpile and not type check', () =>
	{
		const output = execBinWithCache('build --transpileOnly');

		checkCompileFiles();

		expect(output.code).toBe(0);
	});

	afterAll(() =>
	{
		teardownStage(stageName);
	});
});
