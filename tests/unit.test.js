const diff = require('./diff');
const checkString = require('./checkString');

test('subtracts 4 - 3 to equal 1', () => {
  expect(diff(4, 3)).toBe(1);
});

test('words', () => {
  expect(checkString("words")).toBe(console.log("String is filled"));
});