
export const sum = (a: number, b: number) => {
  if ('development' === process.env.NODE_ENV) {
    console.log('dev only output');
  }
  return a + b;
};

export default sum

// @ts-ignore
if (process.env.TSDX_FORMAT !== 'esm')
{
  Object.defineProperty(sum, "__esModule", { value: true });

  Object.defineProperty(sum, 'sum', { value: sum });
  Object.defineProperty(sum, 'default', { value: sum });
}
