import {isPrerelease} from '.';

describe('isPrerelease', () => {
  it('should return false for non-suffixed versions', () => {
    expect(isPrerelease('1.0.0')).toBeFalsy();
    expect(isPrerelease('0.0.0')).toBeFalsy();
    expect(isPrerelease('1231231.12312319067.8543450')).toBeFalsy();
  });
  it('should return true for suffixed versions', () => {
    expect(isPrerelease('1.0.0-x.0')).toBeTruthy();
    expect(isPrerelease('0.0.2-rc')).toBeTruthy();
    expect(isPrerelease('5.2.17-next.123asdcq24raq2')).toBeTruthy();
    expect(isPrerelease('12.8.3-preview.85')).toBeTruthy();
  });
});
