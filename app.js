(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const core = globalThis.VideoInspectorCore;
  const video = $('video');
  let currentInfo = null;
  let currentUrl = null;
  let cancelRead = null;
  let requestId = 0;
  const setText = (id, text) => { $(id).textContent = text; };
  function release() {
    if (cancelRead) { cancelRead(); cancelRead = null; }
    video.pause();
    video.removeAttribute('src');
    video.load();
    if (currentUrl) { URL.revokeObjectURL(currentUrl); currentUrl = null; }
    currentInfo = null;
  }
  function framing() { return core.crop(currentInfo.width, currentInfo.height, $('target').value); }
  function drawCrop() {
    if (!currentInfo) return;
    const frame = framing();
    const overlay = $('crop-overlay');
    overlay.hidden = frame.target === 'original';
    Object.assign(overlay.style, { left: `${frame.leftPercent}%`, top: `${frame.topPercent}%`, width: `${frame.widthPercent}%`, height: `${frame.heightPercent}%` });
    setText('crop-note', frame.target === 'original' ? 'The full frame stays visible. No edges are removed.' : `A centered ${frame.target} crop keeps ${frame.retainedAreaPercent.toFixed(1)}% of the source area. Check both characters and the edges during playback.`);
    if (!$('report-fallback').hidden) $('report-text').value = core.textReport(currentInfo, frame);
  }
  function readMetadata(url) {
    return new Promise((resolve, reject) => {
      const finish = (error) => {
        clearTimeout(timer);
        video.removeEventListener('loadedmetadata', onLoad);
        video.removeEventListener('error', onError);
        cancelRead = null;
        error ? reject(error) : resolve();
      };
      const onLoad = () => finish();
      const onError = () => finish(new Error('This browser could not read the video. Try a supported MP4 or WebM, another browser, or a fresh export of the file.'));
      const timer = setTimeout(() => finish(new Error('Reading the video took too long. Try a smaller clip or a different browser.')), 20000);
      cancelRead = () => finish(new Error('Selection canceled.'));
      video.addEventListener('loadedmetadata', onLoad);
      video.addEventListener('error', onError);
      video.src = url;
      video.load();
    });
  }
  async function openFile(file) {
    if (!file) return;
    const id = ++requestId;
    release();
    $('results').hidden = true;
    $('report-fallback').hidden = true;
    $('error').hidden = true;
    $('target').value = 'original';
    setText('status', 'Reading video metadata on this device…');
    try {
      if (!file.size) throw new Error('This file is empty. Choose a video with content.');
      if (!file.type.startsWith('video/') && !/\.(mp4|mov|webm|m4v|ogv|ogg|avi|mkv)$/i.test(file.name)) {
        throw new Error('Choose a video file, such as an MP4, MOV or WebM.');
      }
      currentUrl = URL.createObjectURL(file);
      await readMetadata(currentUrl);
      if (id !== requestId) return;
      currentInfo = core.inspect({ name:file.name, type:file.type, size:file.size, width:video.videoWidth, height:video.videoHeight, duration:video.duration });
      setText('file-title', currentInfo.name);
      setText('dimensions', `${currentInfo.width} × ${currentInfo.height}`);
      setText('duration', `${currentInfo.durationSeconds.toFixed(2)} s`);
      setText('ratio', currentInfo.aspectRatio);
      setText('size', `${(currentInfo.sizeBytes / 1e6).toLocaleString(undefined, {maximumFractionDigits:2})} MB`);
      setText('orientation', currentInfo.orientation);
      setText('mime', currentInfo.type);
      setText('bitrate', `${currentInfo.averageTotalBitrateMbps.toFixed(2)} Mbps`);
      $('stage').style.aspectRatio = `${currentInfo.width} / ${currentInfo.height}`;
      $('stage').style.width = `${Math.min(600, 360 * currentInfo.width / currentInfo.height)}px`;
      $('results').hidden = false;
      drawCrop();
      setText('status', 'Metadata ready. Your video has not been uploaded. File sizes use decimal MB.');
    } catch (error) {
      if (id !== requestId) return;
      release();
      setText('error', error.message || 'The video could not be read.');
      $('error').hidden = false;
      setText('status', '');
    }
  }
  $('choose').addEventListener('click', () => $('file').click());
  $('file').addEventListener('change', event => { openFile(event.target.files[0]); event.target.value = ''; });
  $('clear').addEventListener('click', () => { ++requestId; release(); $('results').hidden = true; $('report-fallback').hidden = true; $('error').hidden = true; setText('status','File cleared. Choose another video when ready.'); $('choose').focus(); });
  $('target').addEventListener('change', drawCrop);
  $('copy').addEventListener('click', async () => {
    if (!currentInfo) return;
    const text = core.textReport(currentInfo, framing());
    try { await navigator.clipboard.writeText(text); setText('status','Report copied.'); }
    catch { $('report-text').value = text; $('report-fallback').hidden = false; $('report-text').focus(); $('report-text').select(); setText('status','Clipboard access is unavailable. Select and copy the report below.'); }
  });
  $('download').addEventListener('click', () => {
    if (!currentInfo) return;
    const data = { tool:'EasyVideoAI Video Inspector', version:'1.0.0', video:currentInfo, centeredCrop:framing(), notes:['Browser-reported metadata; codec, frame rate and audio presence are not verified.', 'Crop is a visual guide only. No video is modified or exported.'] };
    const url = URL.createObjectURL(new Blob([JSON.stringify(data,null,2)+'\n'],{type:'application/json'}));
    const link = document.createElement('a');
    link.href = url; link.download = 'video-inspector-report.json'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setText('status','JSON report prepared for download.');
  });
  const dropzone = $('dropzone');
  ['dragenter','dragover'].forEach(type => dropzone.addEventListener(type,event => { event.preventDefault(); dropzone.classList.add('dragging'); }));
  ['dragleave','drop'].forEach(type => dropzone.addEventListener(type,event => { event.preventDefault(); dropzone.classList.remove('dragging'); }));
  dropzone.addEventListener('drop', event => openFile(event.dataTransfer.files[0]));
  window.addEventListener('pagehide', () => { ++requestId; release(); });
  window.addEventListener('pageshow', event => { if (event.persisted) { $('results').hidden = true; $('report-fallback').hidden = true; $('error').hidden = true; setText('status', 'Choose a video to inspect on this device.'); } });
})();
