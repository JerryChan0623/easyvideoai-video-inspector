/* Shared by the browser and Node's built-in test runner. */
(function (root) {
  'use strict';
  const validNumber = n => Number.isFinite(n) && n > 0;
  function gcd(a, b) { return b ? gcd(b, a % b) : a; }
  function inspect({ name = 'video', type = '', size, width, height, duration }) {
    if (![size, width, height, duration].every(validNumber)) {
      throw new Error('The browser could not read valid video dimensions, duration and file size.');
    }
    if (![width, height].every(Number.isSafeInteger)) throw new Error('Video dimensions must be whole pixels.');
    const divisor = gcd(width, height);
    const ratio = width / height;
    const standard = [[9,16], [1,1], [16,9], [4,3], [3,4]].find(([w,h]) => Math.abs(ratio / (w/h) - 1) < 0.01);
    return {
      name, type: type || 'Not supplied by browser', sizeBytes: size,
      width, height, durationSeconds: duration,
      aspectRatio: `${width/divisor}:${height/divisor}`,
      nearestStandard: standard ? `${standard[0]}:${standard[1]}` : null,
      orientation: width === height ? 'Square' : width > height ? 'Landscape' : 'Portrait',
      averageTotalBitrateMbps: size * 8 / duration / 1e6,
    };
  }
  function crop(width, height, target) {
    if (![width, height].every(validNumber)) throw new Error('Invalid video dimensions.');
    const targets = { original: width / height, '9:16': 9/16, '1:1': 1, '16:9': 16/9 };
    if (!Object.hasOwn(targets, target)) throw new Error('Unknown crop.');
    const ratio = targets[target];
    const cropWidth = Math.min(width, height * ratio);
    const cropHeight = Math.min(height, width / ratio);
    return {
      target, leftPercent: (width - cropWidth) / width * 50,
      topPercent: (height - cropHeight) / height * 50,
      widthPercent: cropWidth / width * 100, heightPercent: cropHeight / height * 100,
      retainedAreaPercent: cropWidth * cropHeight / (width * height) * 100,
    };
  }
  function textReport(info, framing) {
    return [
      'EasyVideoAI Video Inspector — local file report',
      `File: ${info.name}`, `Browser MIME type: ${info.type}`,
      `Dimensions: ${info.width} × ${info.height} px`,
      `Duration: ${info.durationSeconds.toFixed(3)} seconds`,
      `Aspect ratio: ${info.aspectRatio}${info.nearestStandard ? ` (approximately ${info.nearestStandard})` : ''}`,
      `Orientation: ${info.orientation}`, `File size: ${info.sizeBytes} bytes`,
      `Estimated total average bitrate: ${info.averageTotalBitrateMbps.toFixed(2)} Mbps (includes container overhead and any audio)`,
      `Centered crop: ${framing.target}; keeps ${framing.retainedAreaPercent.toFixed(1)}% of source area`,
      'Crop is a guide only; no video is modified or exported.',
      'Metadata is reported by this browser. Codec, frame rate, audio presence and platform acceptance are not verified.',
      'No video file is uploaded. https://easyvideoai.com',
    ].join('\n');
  }
  const api = { inspect, crop, textReport };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.VideoInspectorCore = Object.freeze(api);
})(globalThis);
