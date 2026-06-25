export default () => {
  (Number.prototype as any).slice = function(num1: number, num2: number) { return this.toString().slice(num1, num2) };
}