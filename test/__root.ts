import { join } from "path";

export const __ROOT = join(__dirname, '..');

export const __ROOT_TEST = join(__ROOT, 'test');

export const isWin = process.platform === "win32";
