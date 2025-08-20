import { HttpMethodColorPipe } from './http-method-color.pipe';

describe('HttpMethodColorPipe', () => {
  it('create an instance', () => {
    const pipe = new HttpMethodColorPipe();
    expect(pipe).toBeTruthy();
  });
});
