import { describe, expect, it } from 'vitest';
import { classifyLink, parseSafeHttpUrl, safeFilename } from '../client/src/media';

describe('VibeLoad URL classification', () => {
  it('recognizes direct MP4 and WebM files', () => {
    expect(classifyLink('https://cdn.example.com/clip.mp4?token=abc').kind).toBe('direct-media');
    expect(classifyLink('https://cdn.example.com/clip.webm').kind).toBe('direct-media');
  });
  it('recognizes audio file types too', () => {
    expect(classifyLink('https://cdn.example.com/song.mp3').kind).toBe('direct-media');
    expect(classifyLink('https://cdn.example.com/song.m4a').kind).toBe('direct-media');
  });
  it('recognizes major social platform URLs without claiming to download them', () => {
    expect(classifyLink('https://youtu.be/abc123').kind).toBe('platform');
    expect(classifyLink('https://www.instagram.com/reel/abc/').kind).toBe('platform');
    expect(classifyLink('https://www.tiktok.com/@demo/video/1').kind).toBe('platform');
    expect(classifyLink('https://x.com/demo/status/1').kind).toBe('platform');
  });
  it('classifies an ordinary page as a webpage', () => {
    expect(classifyLink('https://example.com/watch?id=1').kind).toBe('webpage');
  });
  it('rejects unsafe protocols and private/local hosts', () => {
    expect(() => parseSafeHttpUrl('javascript:alert(1)')).toThrow();
    expect(() => parseSafeHttpUrl('http://localhost:3000')).toThrow();
    expect(() => parseSafeHttpUrl('http://192.168.1.1/video.mp4')).toThrow();
    expect(() => parseSafeHttpUrl('http://[::ffff:127.0.0.1]')).toThrow();
    expect(() => parseSafeHttpUrl('http://10.0.0.2/video.mp4')).toThrow();
  });
  it('sanitizes a suggested filename', () => {
    expect(safeFilename(new URL('https://cdn.example.com/my%20video.mp4'), 'mp4')).toBe('my-video.mp4');
  });
});
