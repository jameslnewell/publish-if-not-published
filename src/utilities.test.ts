import {isPrerelease, getTagFromArgs} from './utilities';

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

describe('getTagFromArgs', () => {
  it('should return undefined if no dist-tag set', () => {
    expect(getTagFromArgs()).toBeUndefined();
    expect(getTagFromArgs(['--registry', 'https://registry.npmjs.org/'])).toBeUndefined();
    expect(getTagFromArgs(['--foo', 'bar', '--baz', 'buzz'])).toBeUndefined();
    expect(getTagFromArgs(['--tag'])).toBeUndefined();
    expect(getTagFromArgs(['--tag', 'latest'])).toBeUndefined();
    expect(getTagFromArgs(['--tag=latest'])).toBeUndefined();
  });
  it('should return the next item in the args array if tag is set', () => {
    expect(getTagFromArgs(['--tag=next'])).toEqual('next');
    expect(getTagFromArgs(['--tag', 'next'])).toEqual('next');
    expect(getTagFromArgs(['--foo', 'bar', '--tag', 'preview', '--baz', 'buzz'])).toEqual('preview');
  });
});
