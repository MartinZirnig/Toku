import { UID } from './constants';

describe('Constants', () => {
  it('should create an instance', () => {
    expect(new UID()).toBeTruthy();
  });
});
