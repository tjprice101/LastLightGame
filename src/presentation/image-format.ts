// Runtime art is served as visually lossless AVIF siblings of the canonical
// PNGs (tools/build_avif.mjs). PNG remains the fallback for browsers or
// networks that cannot deliver/decode the AVIF copy.
const AVIF_PROBE = 'data:image/avif;base64,AAAAHGZ0eXBhdmlmAAAAAG1pZjFhdmlmbWlhZgAAAXBtZXRhAAAAAAAAACFoZGxyAAAAAAAAAABwaWN0AAAAAAAAAAAAAAAAAAAAAA5waXRtAAAAAAABAAAANGlsb2MAAAAAREAAAgABAAAAAAGUAAEAAAAAAAAAGQACAAAAAAGtAAEAAAAAAAAAEQAAADhpaW5mAAAAAAACAAAAFWluZmUCAAAAAAEAAGF2MDEAAAAAFWluZmUCAAAAAAIAAGF2MDEAAAAAr2lwcnAAAACKaXBjbwAAAAxhdjFDgSACAAAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAcAAAAAA5waXhpAAAAAAEIAAAAOGF1eEMAAAAAdXJuOm1wZWc6bXBlZ0I6Y2ljcDpzeXN0ZW1zOmF1eGlsaWFyeTphbHBoYQAAAAAdaXBtYQAAAAAAAAACAAEDgQIDAAIEhAIFhgAAABppcmVmAAAAAAAAAA5hdXhsAAIAAQABAAAAMm1kYXQSAAoHOAAGEBDQaTIMGAAKKKKEAACwE0vYEgAKBBgABhUyBxgAKKEAEKA=';
const THUMB_FOLDERS = /\/assets\/(characters|enemies|profile-pictures)\/[^/?]+\.avif(\?|$)/;
export const THUMB_WIDTH = 384;
export const FULL_WIDTH = 960;

let avif = true;

export function avifPreferred(): boolean { return avif; }
export function setAvifPreferred(value: boolean): void { avif = value; }

/** Resolves once the browser has confirmed whether it can decode AVIF. */
export function detectAvif(doc: Document = document): Promise<boolean> {
  return new Promise(resolve => {
    const image = doc.createElement('img');
    const done = (ok: boolean) => { avif = ok; resolve(ok); };
    image.onload = () => done(image.naturalWidth > 0);
    image.onerror = () => done(false);
    image.src = AVIF_PROBE;
  });
}

export function runtimeArtPath(path: string): string {
  return avif ? path.replace(/\.png$/, '.avif') : path;
}

export function pngFallback(url: string): string | null {
  return /\.(thumb\.)?avif(\?|$)/.test(url) ? url.replace(/\.(thumb\.)?avif(?=\?|$)/, '.png') : null;
}

export function thumbnailSrcset(url: string): string | null {
  const match = THUMB_FOLDERS.exec(url);
  if (!match) return null;
  const full = match[1] === 'profile-pictures' ? 1024 : FULL_WIDTH;
  return `${url.replace(/\.avif(?=\?|$)/, '.thumb.avif')} ${THUMB_WIDTH}w, ${url} ${full}w`;
}
