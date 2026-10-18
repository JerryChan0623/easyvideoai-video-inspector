# EasyVideoAI Video Inspector

A free, open-source video metadata checker with centered crop previews. Check a local video's dimensions, duration, aspect ratio and file size before you edit or share it.

Made by [EasyVideoAI](https://easyvideoai.com), a photo-to-video app with prepared dance and character templates. The inspector works independently: no account, API key or paid generation is required.

**[Open the live inspector](https://jerrychan0623.github.io/easyvideoai-video-inspector/)** · [Beginner's EasyVideoAI guide](https://glittery-seaplane-07c.notion.site/EasyVideoAI-Guide-Create-AI-Videos-From-Your-Photos-3fd3335992748089a443c3466ffde00f) · [Report an issue](https://github.com/JerryChan0623/easyvideoai-video-inspector/issues)

## What it does

- Reads video width, height, duration, file size and browser-provided MIME type.
- Shows the exact reduced aspect ratio and orientation.
- Previews centered **9:16**, **1:1** and **16:9** crops, with shaded edges and the percentage of source area retained.
- Plays your local file so you can review motion and framing over the whole clip.
- Copies a plain-text report or downloads a JSON report.
- Runs entirely in your browser, with no dependencies or external scripts.

This is useful for checking downloaded AI videos, phone clips and editing exports. A vertical crop of a two-person scene may remove a character, hand or foot near the edge; the preview makes that trade-off visible before you edit.

## Quick start

Use the [hosted tool](https://jerrychan0623.github.io/easyvideoai-video-inspector/), or download this repository and open **index.html** in a modern browser. Keep `index.html`, `styles.css`, `metrics.js` and `app.js` in the same folder.

1. Choose or drop a local video.
2. Read its dimensions, duration, aspect ratio and size.
3. Select a centered crop and play the whole clip to check the boundaries.
4. Copy the report or save its JSON if you need to share the specifications.
5. Clear the file when finished.

If your browser blocks clipboard access for local files, the tool shows a selectable report for manual copying. It does not modify or export a cropped video.

To serve the files locally, Python is sufficient:

```sh
git clone https://github.com/JerryChan0623/easyvideoai-video-inspector.git
cd easyvideoai-video-inspector
python3 -m http.server 8080 --bind 127.0.0.1
```

Then open `http://127.0.0.1:8080`.

## Privacy

The inspector uses the browser's `File` API and a temporary object URL. **Your selected video is not uploaded.** There are no analytics, cookies, external fonts or third-party runtime scripts, and the tool does not save selected files in browser storage. Clearing the file or closing the page releases its object URL.

The hosting provider receives ordinary page requests when you use the hosted version. Links to EasyVideoAI include referral parameters for visits to that separate website; selecting a local file does not contact EasyVideoAI. Running the downloaded files locally avoids hosting requests altogether.

Reports include the selected filename and metadata. Review them before sharing if a filename contains private information.

## What the numbers mean

| Field | Meaning |
| --- | --- |
| Dimensions | Browser-reported display width and height in pixels |
| Duration | Browser-reported duration; the UI rounds to two decimal places |
| Aspect ratio | Width:height reduced to the smallest whole numbers |
| File size | Decimal MB; 1 MB = 1,000,000 bytes |
| Estimated total bitrate | File size × 8 ÷ duration, including container overhead and any audio |
| Retained area | The source area inside the selected centered crop, as a percentage |

For example, cropping a 1920 × 1080 video to 9:16 retains about **31.6%** of the original area. That is a geometric calculation, not a measurement of image quality or a recommendation for every scene.

## Limitations

- Container and codec support depends on your browser. A readable file extension does not prove that its contents will play.
- Codec, frame rate, audio presence, HDR and color information are not verified by this tool.
- Metadata can be inaccurate or unavailable for malformed files. Unsupported and non-finite metadata is rejected.
- Crop previews are centered geometric guides. They do not track faces, predict another editor's crop, validate social-platform upload requirements or export a new video.
- Dimensions alone cannot establish visual quality, identity consistency, audio synchronization or rights to share a clip.

## Using it with EasyVideoAI

[EasyVideoAI](https://easyvideoai.com/?utm_source=github&utm_medium=referral&utm_campaign=video_inspector) uses prepared video templates and character photos. Its current studios do **not** accept arbitrary source videos. You can use this inspector after downloading a result, or with any unrelated local video.

Useful starting points:

- [EasyVideoAI creation guides](https://easyvideoai.com/guides)
- [Smalltown Boy two-character studio](https://easyvideoai.com/smalltown-boy-ai)
- [Photo selection guide](https://easyvideoai.com/ai-video-photo-guide)
- [Original, square and vertical framing](https://easyvideoai.com/ai-video-aspect-ratio-guide)
- [Current credits and pricing](https://easyvideoai.com/pricing)

The inspector is free. Creating a personalized video on EasyVideoAI is a separate service that requires credits; the studio shows the quote before confirmation.

## Development and tests

No build step or package installation is needed. Node.js 20 or later is required only to run the tests:

```sh
npm test
```

The tests cover metadata validation, exact versus approximate ratios, crop geometry for portrait and landscape inputs, and report limitations. Browser file loading and playback should also be checked manually after changes to `app.js`.

## Contributing

Bug reports and focused fixes are welcome. Include your browser, operating system and non-sensitive reproduction details. Do not attach a private video or an unpublished portrait to a public issue. Use a synthetic test clip when possible.

## License

[MIT](LICENSE). You can use or adapt the inspector under that license. EasyVideoAI's hosted generation service has its own [terms](https://easyvideoai.com/terms) and [privacy policy](https://easyvideoai.com/privacy).
