export default () => {
  Object.defineProperty(
    Object.prototype,
    'vals',
    {
      value: function () { return Object.values(this); },
      enumerable: false,
    }
  );
}