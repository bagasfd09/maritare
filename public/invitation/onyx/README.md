# Onyx built-in sample assets

Defaults shipped with the Onyx template, wired in
`src/components/invitation/onyx/onyx-sample.ts`. Every one is a **fallback**: a
couple's own uploaded photo / hero video / closing image always wins. These only
fill what's still empty, so a fresh draft and the catalog preview look like the
reference design instead of placeholder silhouettes.

Source: the reference project at `~/Downloads/web-undangan` (a Figma Make
React/Vite export) — its own `assets/` plus the Unsplash photos its `App.tsx`
hot-linked, downloaded here so the template has no external image dependency.

| File | From | Used by |
|---|---|---|
| `backdrop.mp4` | reference `assets/video/trailer.mp4` (4.9 MB, unmodified — no ffmpeg available to re-encode) | fixed backdrop + cover gate |
| `groom.jpg`, `bride.jpg` | reference `assets/img/*/*-edited.jpg`, resized to 700×700 | couple portraits |
| `gallery-1..8.jpg` | the 8 Unsplash photos in `App.tsx`, re-encoded (mozjpeg q78) | gallery masonry, in the reference's order |
| `venue.jpg` | Unsplash cityscape from `App.tsx` | venue map panel |
| `closing.jpg` | Unsplash photo from `App.tsx` | closing band wash |

Images total ~0.75 MB.

## `music.mp3` — NOT COMMITTED

The reference's `background-music.mp3` is **10.2 MB**, well over the 3 MB cap
this repo sets for background music (see `public/audio/README.md`), and it would
be a 10 MB download for every guest on mobile data. It was left out rather than
committed against that rule.

`onyx-sample.ts` already points at `/invitation/onyx/music.mp3` and the template
passes it to `ScarletAudio` as `fallbackSrc`, so dropping a compressed file here
enables it with no code change:

```
ffmpeg -i background-music.mp3 -b:a 128k -ac 2 music.mp3
```

Until the file exists the audio toggle hides itself automatically (the `<audio>`
element fires `onError`) — the invitation works fine without it.

## Licensing

The Unsplash photos are used under the Unsplash License. The `trailer.mp4` and
the couple portraits come from the supplied reference project — confirm you hold
the rights to redistribute them before this template ships to customers, since
they will be served publicly as the template's default artwork.
