import { checkCompileFiles, getStageName, setupStageWithFixture, teardownStage } from '../utils/fixture';
import { execBin, shellSilentInCi } from '../utils/shell';

shellSilentInCi();

const testDir = 'e2e';
const fixtureName = 'build-lazy-cjs';
const stageName = getStageName(testDir, fixtureName);

describe('build', () =>
{

	beforeAll(() =>
	{
		teardownStage(stageName);
		setupStageWithFixture(testDir, stageName, fixtureName);
	});

	it('should compile files into a dist directory', () =>
	{
		const output = execBin('build --format cjs,esm', {
			silent: false,
		})

		checkCompileFiles();

		expect(output.code).toBe(0);
	});

	it('sum', () =>
	{
		const sum = require(`../../${stageName}/dist/index.cjs`);

		expect(sum).toHaveProperty('sum')
		expect(sum).toHaveProperty('default')

		expect(() => sum(1, 1)).not.toThrow()
		expect(() => sum.sum(1, 1)).not.toThrow()
		expect(() => sum.default(1, 1)).not.toThrow()
	});

	afterAll(() =>
	{
		teardownStage(stageName);
	});

});
