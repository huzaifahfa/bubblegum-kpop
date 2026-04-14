"use client"
import { useRef, useState, useEffect } from "react";
import React from 'react';
import './sprite.css';
import Typewriter from './typewriter';
import { Analytics } from "@vercel/analytics/next"

// pixelwalk.png: 16×32 frames, 4 cols × 4 rows
const FRAME_W = 16;
const FRAME_H = 32;
const SCALE = 3;
const COLS = 4;
const SPEED = 3;

// Displayed character size (matches sprite.css)
const CHAR_W = 49;
const CHAR_H = 96;

// Row in the spritesheet per direction
const DIR_ROW: Record<string, number> = { down: 0, up: 1, right: 2, left: 3 };

// ─── Background image ─────────────────────────────────────────────────────────
// The background is rendered with background-size: cover (centered).
// All hotspot positions are expressed in the original image's pixel space
// and converted to screen coordinates at runtime.
const BG_W = 1100;
const BG_H = 900;

const WELCOME_TEXT = "Hi, and welcome to my bubblegum kpop neighborhood ヽ(・∀・)ﾉ\nWalk to any house to start a song and learn more about them! (╯✧▽✧)╯\np.s. There are more fun, catchy, and energetic songs in the Spotify playlist above! (๑˃ᴗ˂)ﻭ";

type HotspotDef = {
  id: string;
  imgX: number;
  imgY: number;
  imgW: number;
  imgH: number;
  uri: string;
  note: string;  // text shown on the notepad when this house is entered
};

const HOTSPOT_DEFS: HotspotDef[] = [
  {
    id: "house-1",
    imgX: 200, imgY: 305, imgW: 80, imgH: 60,
    uri: "spotify:track:3bD1rBz24Pnu6tjXf4wJxH",
    note: "FUN! uses onomatopoeias for exaggerated descriptions, such as \n사르르르, 주르르륵, and 핑그르르.\nThey also use Konglish, rhyming 아리아나 그란데 \nwith 왜 그런대?\nThey match the energy the song brings ☆*:.｡.o(≧▽≦)o.｡.:*☆",
  },
  {
    id: "house-2",
    imgX: 478, imgY: 305, imgW: 65, imgH: 60,
    uri: "spotify:track:4gdCLKxDflDweye4bsfNnW",
    note: "In Bar Bar Bar, 반말 is used to add more hype to the song. The lyrics become commands to invite the listeners to dance together, \nlike 소리쳐 and 뛰어봐.\nOnomatopoeias are also used, like 호 and 쿵. A serotonin-filled song (((o(*°▽°*)o)))",
  },
  {
    id: "house-3",
    imgX: 572, imgY: 490, imgW: 65, imgH: 58,
    uri: "spotify:track:53Wa5dwbGUT8Jcg08FYfV5",
    note: "긴가민가 is an interesting phase in Korean that means you're unsure/confused about something.\nThis song connects back to the disconnect one feels in the confusing adult world, using 긴가민가 as the root. It's an upbeat and rhythm-filled song! ヽ(*⌒▽⌒*)ﾉ",
  },
  {
    id: "house-4",
    imgX: 740, imgY: 300, imgW: 80, imgH: 65,
    uri: "spotify:track:0qpCYOgfvMVfjOdaqVbYMY",
    note: "아리송 is a Korean phrase that means ambiguous, vague, and confusing, that comes from 아리송하다. 아리송 is supposed to explain how the singer's confused by the person they like!\nMimetic words like 빙빙, 핑핑, and 살랑 are also used. A loud, fun track (ﾉ´ヮ)ﾉ*: ･ﾟ",
  },
  {
    id: "house-5",
    imgX: 333, imgY: 488, imgW: 80, imgH: 60,
    uri: "spotify:track:5fWKr5p15BTazjflJ6HX5j",
    note: "Mimetic words, or 의태어, are used in Catallena to add more imagery to the action described, \nlike 까칠까칠 and 흔들흔들.\nCombined with onomatopoeias, these words induce the listener's senses, adding bounce and zest to the song ٩(◕‿◕｡)۶",
  },
];

// ─── Flowers ─────────────────────────────────────────────────────────────────
// Fixed positions in image-space (BG_W×BG_H = 1100×900).
// Placed near the title text, around each house, and in empty corner/edge areas.
type FlowerDef = { id: number; imgX: number; imgY: number; delay: number };
type ScreenFlower = FlowerDef & { x: number; y: number; size: number };

const FLOWER_DEFS: FlowerDef[] = [
  // ── Near title text (left side, y≈35–155 is the text band) ──
  { id:  0, imgX:  88, imgY:  65, delay: 0.10 },
  { id:  1, imgX: 108, imgY:  98, delay: 0.35 },
  { id:  2, imgX:  92, imgY: 130, delay: 0.55 },
  { id:  3, imgX: 125, imgY:  80, delay: 0.20 },
  // ── Scatter below left-title flowers ──
  { id: 53, imgX:  18, imgY: 162, delay: 0.20 },
  { id: 54, imgX:  45, imgY: 158, delay: 0.45 },
  { id: 55, imgX:  72, imgY: 165, delay: 0.10 },
  { id: 56, imgX: 100, imgY: 160, delay: 0.55 },
  { id: 57, imgX: 128, imgY: 163, delay: 0.30 },
  { id: 58, imgX: 152, imgY: 158, delay: 0.15 },
  { id: 59, imgX:  392, imgY: 125, delay: 0.20 },
  { id: 60, imgX:  422, imgY: 135, delay: 0.45 },
  { id: 61, imgX:  452, imgY: 145, delay: 0.10 },
  { id: 62, imgX: 472, imgY: 158, delay: 0.55 },
  { id: 63, imgX: 500, imgY: 190, delay: 0.30 },
  { id: 64, imgX: 520, imgY: 149, delay: 0.15 },
  { id: 65, imgX:  192, imgY: 125, delay: 0.20 },
  { id: 66, imgX:  222, imgY: 135, delay: 0.45 },
  { id: 67, imgX:  252, imgY: 145, delay: 0.10 },
  { id: 68, imgX: 272, imgY: 158, delay: 0.55 },
  // ── Near title text (right side) ──
  { id:  4, imgX: 792, imgY:  48, delay: 0.40 },
  { id:  5, imgX: 822, imgY:  78, delay: 0.15 },
  { id:  6, imgX: 852, imgY:  52, delay: 0.60 },
  { id:  7, imgX: 872, imgY: 108, delay: 0.30 },
  // ── Around house-1 (imgX:200 imgY:305 imgW:80 imgH:60) ──
  { id:  8, imgX: 108, imgY: 318, delay: 0.10 },
  { id:  9, imgX: 122, imgY: 355, delay: 0.45 },
  { id: 10, imgX: 332, imgY: 312, delay: 0.25 },
  { id: 11, imgX: 348, imgY: 350, delay: 0.55 },
  // ── Around house-2 (imgX:478 imgY:305 imgW:65 imgH:60) ──
  { id: 12, imgX: 408, imgY: 318, delay: 0.30 },
  { id: 13, imgX: 418, imgY: 355, delay: 0.10 },
  { id: 14, imgX: 598, imgY: 312, delay: 0.50 },
  { id: 15, imgX: 612, imgY: 348, delay: 0.20 },
  // ── Around house-4 (imgX:740 imgY:300 imgW:80 imgH:65) ──
  { id: 16, imgX: 668, imgY: 312, delay: 0.35 },
  { id: 17, imgX: 672, imgY: 348, delay: 0.60 },
  { id: 18, imgX: 878, imgY: 305, delay: 0.15 },
  { id: 19, imgX: 888, imgY: 342, delay: 0.40 },
  // ── Around house-5 (imgX:333 imgY:488 imgW:80 imgH:60) ──
  { id: 20, imgX: 248, imgY: 495, delay: 0.25 },
  { id: 21, imgX: 258, imgY: 530, delay: 0.55 },
  { id: 22, imgX: 465, imgY: 495, delay: 0.10 },
  { id: 23, imgX: 472, imgY: 530, delay: 0.40 },
  // ── Around house-3 (imgX:572 imgY:490 imgW:65 imgH:58) ──
  { id: 24, imgX: 495, imgY: 500, delay: 0.30 },
  { id: 25, imgX: 490, imgY: 535, delay: 0.60 },
  { id: 26, imgX: 695, imgY: 500, delay: 0.20 },
  { id: 27, imgX: 705, imgY: 535, delay: 0.45 },
  // ── Top-left corner cluster ──
  { id: 28, imgX:  22, imgY:  22, delay: 0.30 },
  { id: 29, imgX:  48, imgY:  14, delay: 0.10 },
  { id: 30, imgX:  38, imgY:  55, delay: 0.50 },
  { id: 31, imgX:  68, imgY:  32, delay: 0.20 },
  // ── Top-right corner cluster (below Spotify player) ──
  { id: 32, imgX: 1012, imgY: 250, delay: 0.40 },
  { id: 33, imgX: 1042, imgY: 275, delay: 0.15 },
  { id: 34, imgX: 1028, imgY: 300, delay: 0.58 },
  { id: 35, imgX: 1068, imgY: 262, delay: 0.35 },
  // ── Bottom-center empty cluster ──
  { id: 36, imgX: 472, imgY: 682, delay: 0.20 },
  { id: 37, imgX: 502, imgY: 712, delay: 0.45 },
  { id: 38, imgX: 538, imgY: 692, delay: 0.10 },
  { id: 39, imgX: 482, imgY: 742, delay: 0.60 },
  { id: 40, imgX: 562, imgY: 728, delay: 0.30 },
  // ── Left-edge mid cluster ──
  { id: 41, imgX:  22, imgY: 462, delay: 0.15 },
  { id: 42, imgX:  48, imgY: 498, delay: 0.40 },
  { id: 43, imgX:  28, imgY: 538, delay: 0.25 },
  // ── Right-edge mid cluster ──
  { id: 44, imgX: 1012, imgY: 458, delay: 0.50 },
  { id: 45, imgX: 1042, imgY: 492, delay: 0.10 },
  { id: 46, imgX: 1022, imgY: 532, delay: 0.40 },
  // ── Bottom-left cluster ──
  { id: 47, imgX:  28, imgY: 732, delay: 0.35 },
  { id: 48, imgX:  55, imgY: 762, delay: 0.15 },
  { id: 49, imgX:  38, imgY: 802, delay: 0.55 },
  // ── Bottom-right cluster ──
  { id: 50, imgX: 1012, imgY: 732, delay: 0.20 },
  { id: 51, imgX: 1042, imgY: 762, delay: 0.45 },
  { id: 52, imgX: 1028, imgY: 802, delay: 0.10 },
];

function toScreenFlowers(defs: FlowerDef[], vpW: number, vpH: number): ScreenFlower[] {
  const scale   = Math.max(vpW / BG_W, vpH / BG_H);
  const offsetX = (vpW - BG_W * scale) / 2;
  const offsetY = (vpH - BG_H * scale) / 2;
  const size    = 30 * scale;
  return defs
    .map(d => ({
      ...d,
      x:    d.imgX * scale + offsetX,
      y:    d.imgY * scale + offsetY,
      size,
    }))
    // drop flowers whose bounding box falls entirely outside the viewport
    .filter(f => f.x + f.size > 0 && f.x < vpW && f.y + f.size > 0 && f.y < vpH);
}

// ─── Cover math ───────────────────────────────────────────────────────────────
type ScreenHotspot = HotspotDef & { x: number; y: number; width: number; height: number };

function toScreenHotspots(defs: HotspotDef[], vpW: number, vpH: number): ScreenHotspot[] {
  const scale   = Math.max(vpW / BG_W, vpH / BG_H);
  const offsetX = (vpW - BG_W * scale) / 2;
  const offsetY = (vpH - BG_H * scale) / 2;
  return defs.map(d => ({
    ...d,
    x:      d.imgX * scale + offsetX,
    y:      d.imgY * scale + offsetY,
    width:  d.imgW * scale,
    height: d.imgH * scale,
  }));
}

// ─── Character ───────────────────────────────────────────────────────────────
type MovableCharacterProps = {
  hotspots: ScreenHotspot[];
  onEnterHotspot: (uri: string) => void;
};

const MovableCharacter = ({ hotspots, onEnterHotspot }: MovableCharacterProps) => {
  const elRef      = useRef<HTMLDivElement>(null);
  const pos        = useRef({ x: 200, y: 350 });
  const dir        = useRef<'down' | 'left' | 'right' | 'up'>('down');
  const frame      = useRef(0);
  const frameTick  = useRef(0);
  const keys       = useRef(new Set<string>());
  const raf        = useRef<number>(0);
  const activeZone = useRef<string | null>(null);

  // Keep latest props accessible inside the rAF loop without re-creating it
  const hotspotsRef = useRef(hotspots);
  const onEnterRef  = useRef(onEnterHotspot);
  useEffect(() => { hotspotsRef.current = hotspots; },        [hotspots]);
  useEffect(() => { onEnterRef.current  = onEnterHotspot; },  [onEnterHotspot]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      keys.current.add(e.key);
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key))
        e.preventDefault();
    };
    const onKeyUp = (e: KeyboardEvent) => keys.current.delete(e.key);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup',   onKeyUp);

    const TICKS_PER_FRAME = 8;

    const tick = () => {
      let dx = 0, dy = 0;
      const k = keys.current;
      if (k.has('ArrowLeft')  || k.has('a') || k.has('A')) { dx = -SPEED; dir.current = 'left';  }
      if (k.has('ArrowRight') || k.has('d') || k.has('D')) { dx =  SPEED; dir.current = 'right'; }
      if (k.has('ArrowUp')    || k.has('w') || k.has('W')) { dy = -SPEED; dir.current = 'up';    }
      if (k.has('ArrowDown')  || k.has('s') || k.has('S')) { dy =  SPEED; dir.current = 'down';  }

      const moving = dx !== 0 || dy !== 0;

      if (moving) {
        pos.current.x += dx;
        pos.current.y += dy;
        // Keep sprite within the viewport
        pos.current.x = Math.max(0, Math.min(window.innerWidth  - CHAR_W, pos.current.x));
        pos.current.y = Math.max(0, Math.min(window.innerHeight - CHAR_H, pos.current.y));
        if (++frameTick.current >= TICKS_PER_FRAME) {
          frameTick.current = 0;
          frame.current = (frame.current + 1) % COLS;
        }
      } else {
        frame.current    = 0;
        frameTick.current = 0;
      }

      // Hotspot collision — use character center point
      const cx = pos.current.x + CHAR_W / 2;
      const cy = pos.current.y + CHAR_H / 2;
      let hit: string | null = null;
      for (const hs of hotspotsRef.current) {
        if (cx >= hs.x && cx <= hs.x + hs.width && cy >= hs.y && cy <= hs.y + hs.height) {
          hit = hs.id;
          if (activeZone.current !== hs.id) {
            activeZone.current = hs.id;
            onEnterRef.current(hs.uri);
          }
          break;
        }
      }
      if (!hit) activeZone.current = null;

      if (elRef.current) {
        const row = DIR_ROW[dir.current];
        elRef.current.style.left               = `${pos.current.x}px`;
        elRef.current.style.top                = `${pos.current.y}px`;
        elRef.current.style.backgroundPosition =
          `${-(frame.current * FRAME_W * SCALE)}px ${-(row * FRAME_H * SCALE)}px`;
      }

      raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup',   onKeyUp);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return <div ref={elRef} className="character" />;
};

// ─── Spotify types ────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpotifyController = any;
declare global {
  interface Window { onSpotifyIframeApiReady: (api: SpotifyController) => void; }
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const embedRef  = useRef<HTMLDivElement>(null);
  const spotifyRef = useRef<SpotifyController>(null);
  const [iFrameAPI,    setIFrameAPI]    = useState<SpotifyController>(undefined);
  const [playerLoaded, setPlayerLoaded] = useState(false);
  const [uri] = useState("spotify:playlist:4YM2wFmNhiEXtnopDN0Rk1");

  // Notepad typewriter state
  const [notepadText, setNotepadText] = useState(WELCOME_TEXT);
  const [typewriterKey, setTypewriterKey] = useState(0);

  // Screen-space hotspots — recomputed on resize
  const [hotspots, setHotspots] = useState<ScreenHotspot[]>([]);

  const [screenFlowers, setScreenFlowers] = useState<ScreenFlower[]>([]);

  useEffect(() => {
    const update = () => {
      const vw = window.innerWidth, vh = window.innerHeight;
      setHotspots(toScreenHotspots(HOTSPOT_DEFS, vw, vh));
      setScreenFlowers(toScreenFlowers(FLOWER_DEFS, vw, vh));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Spotify embed setup
  useEffect(() => {
    const script = document.createElement("script");
    script.src   = "https://open.spotify.com/embed/iframe-api/v1";
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  useEffect(() => {
    if (iFrameAPI) return;
    window.onSpotifyIframeApiReady = (api: SpotifyController) => setIFrameAPI(api);
  }, [iFrameAPI]);

  useEffect(() => {
    if (playerLoaded || iFrameAPI === undefined) return;
    iFrameAPI.createController(
      embedRef.current,
      { width: "100%", height: "120", uri },
      (ctrl: SpotifyController) => {
        ctrl.addListener("ready", () => {
          setPlayerLoaded(true);
          ctrl.play(); // autoplay the playlist on load
        });
        ctrl.addListener("playback_update", (e: SpotifyController) => {
          const { position, duration, isBuffering, isPaused, playingURI } = e.data;
          console.log(`pos:${position} dur:${duration} buf:${isBuffering} paused:${isPaused} uri:${playingURI}`);
        });
        ctrl.addListener("playback_started", (e: SpotifyController) => {
          console.log(`Started: ${e.data.playingURI}`);
        });
        spotifyRef.current = ctrl;
      }
    );
    return () => { spotifyRef.current?.removeListener("playback_update"); };
  }, [playerLoaded, iFrameAPI, uri]);

  const handleEnterHotspot = (trackUri: string) => {
    if (!spotifyRef.current) return;
    spotifyRef.current.loadUri(trackUri);
    spotifyRef.current.play();

    const house = HOTSPOT_DEFS.find(h => h.uri === trackUri);
    if (house) {
      setNotepadText(house.note);
      setTypewriterKey(k => k + 1); // remounts Typewriter so it restarts from the beginning
    }
  };


  return (
    <div
      style={{
        backgroundImage: "url(/backgroundkor10.png)",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      {/* Hotspot zones — amber dashed boxes overlaid on each building door.
          Remove the border/backgroundColor once you're happy with placement. */}
      {hotspots.map(hs => (
        <div
          key={hs.id}
          style={{
            position: 'absolute',
            left: hs.x, top: hs.y,
            width: hs.width, height: hs.height,
            pointerEvents: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            imageRendering: 'pixelated',
          }}
        >
        </div>
      ))}

      {screenFlowers.map(f => (
        <div
          key={f.id}
          className="flower"
          style={{ left: f.x, top: f.y, width: f.size, height: f.size, animationDelay: `${f.delay}s` }}
        />
      ))}

      <MovableCharacter hotspots={hotspots} onEnterHotspot={handleEnterHotspot} />

      {/* Notepad — bottom-right corner */}
      <div style={{
        position: 'absolute',
        bottom: -5,
        right: -81,
        width: '100%',
        maxWidth: 460,
        height: '100%',
        maxHeight: 450,
        zIndex: 10,
        pointerEvents: 'none',
      }}>
        <img
          src="/notepadpixel.png"
          alt="notepad"
          style={{ width: '100%', height: '100%', imageRendering: 'pixelated', display: 'block' }}
        />
        {/* Typewriter text overlaid on the notepad writing area.
            Tweak top/left/right/fontSize to align with the lines. */}
        <div style={{
          position: 'absolute',
          top: '20%',    
          left: '24%',
          right: '26%',
          fontFamily: 'var(--font-pixelify-sans)',
          fontSize: 18,
          color: '#3b1f2b',
          lineHeight: 1.7,
          whiteSpace: 'pre-wrap',
          pointerEvents: 'none',
        }}>
          <Typewriter key={typewriterKey} text={notepadText} delay={50} />
        </div>
      </div>

      {/* Spotify player — top-right corner */}
      <div style={{ position: 'absolute', top: 16, right: 16, width: 360, zIndex: 10 }}>
        <div ref={embedRef} />
        {!playerLoaded && (
          <p style={{ color: '#888', fontFamily: 'monospace', fontSize: 12 }}>Loading player…</p>
        )}
      </div>
    </div>
  );
}
