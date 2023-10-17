// regression test for generators
export function* testGenerator() {
  // @ts-ignore
  return yield true;
}
