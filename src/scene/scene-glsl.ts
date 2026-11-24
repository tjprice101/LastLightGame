/**
 * Living scenes (D-496): the menu background is one full-screen fragment shader per context, with no
 * image art. A scene is `vec3 scene(vec2 p, vec2 uv)`, wrapped by a shared prelude (noise, stars, drifting
 * particles, light) and a shared finish (parallax, vignette, soft tonemap, grain).
 *
 * `p` is aspect-correct, centred and y-up: y runs -0.5 to 0.5 on landscape (up to -0.75 to 0.75 on a
 * phone, where the view pulls back), and focal points stay near x = 0. Every scene uses only the three palette colours
 * (uC1 deep, uC2 mid, uC3 accent) so one scene can be recoloured per context.
 *
 * WebGL 1 (GLSL ES 1.00). `smoothstep` is only ever called with rising edges.
 */
export const sceneVertex = `attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0., 1.); }
`;

/** Uniforms every scene program exposes (scene-engine.ts looks these up). */
export const sceneUniforms = ['uRes', 'uTime', 'uPulse', 'uIntensity', 'uPointer', 'uFade', 'uOctaves', 'uC1', 'uC2', 'uC3'] as const;

const prelude = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uRes;
uniform float uTime;
uniform float uPulse;
uniform float uIntensity;
uniform vec2 uPointer;
uniform float uFade;
uniform float uOctaves;
uniform vec3 uC1;
uniform vec3 uC2;
uniform vec3 uC3;

#define TAU 6.2831853
mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float hash1(float n) { return fract(sin(n) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1., 0.)), u.x), mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), u.x), u.y);
}
// Normalised to 0..1 whatever the octave count, so low quality keeps the same shapes.
float fbm(vec2 p) {
  float v = 0., a = .5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) {
    if (float(i) >= uOctaves) break;
    v += a * noise(p);
    p = m * p;
    a *= .5;
  }
  return v / (1. - 2. * a);
}
float fbm3(vec2 p) {
  float v = 0., a = .5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 3; i++) { v += a * noise(p); p = m * p; a *= .5; }
  return v / .875;
}
vec3 hue(float h) { return .5 + .5 * cos(TAU * (h + vec3(0., .33, .67))); }
// 1 below a, 0 above b.
float fall(float a, float b, float x) { return 1. - smoothstep(a, b, x); }
// A hairline of light at distance d: bright core, long soft tail.
float glowLine(float d, float w) { return w / (abs(d) + w * 1.4); }
// A crisp line with no tail, for marks that must not smear when dashed.
float hairline(float d, float w) { d /= w; return exp(-d * d); }
// Soft-edged dashes along x (0..1 repeating), lit for the first duty of each period.
float dash(float x, float duty) { x = fract(x); return smoothstep(0., .05, x) * fall(duty - .05, duty, x); }

// Twinkling star field; returns brightness.
float stars(vec2 p, float scale, float t) {
  p *= scale;
  vec2 id = floor(p), f = fract(p) - .5;
  float h = hash(id);
  vec2 o = (vec2(hash(id + 3.1), hash(id + 9.7)) - .5) * .7;
  float d = length(f - o);
  float twinkle = .55 + .45 * sin(t * (.8 + h * 2.5) + h * 40.);
  return max(0., (h - .82) / .18) * twinkle * (fall(0., .09, d) * .35 + fall(0., .025, d));
}

// Cell particles falling (speed > 0) or rising (speed < 0). Shape: 0 mote, 1 crystal shard, 2 leaf, 3 streak.
float drift(vec2 p, float scale, float speed, float t, float size, float sway, float shape, float seed) {
  p *= scale;
  p.y += t * speed;
  p.x += sin(p.y * .35 + t * .4 + seed) * sway;
  vec2 id = floor(p), f = fract(p) - .5;
  float h = hash(id + seed);
  if (h < .55) return 0.;
  vec2 q = f - (vec2(hash(id + 1.3 + seed), hash(id + 7.1 + seed)) - .5) * .6;
  float d;
  if (shape < .5) { d = length(q); }
  else if (shape < 1.5) { q = rot(h * TAU + t * (h - .5) * .8) * q; d = abs(q.x) * 1.9 + abs(q.y) * .85; }
  else if (shape < 2.5) { q = rot(h * TAU + sin(t * .8 + h * 9.) * .7) * q; d = length(vec2(q.x * 2.4, q.y + abs(q.x) * .9)); }
  else { d = length(vec2(q.x * 3.4, q.y)); }
  return fall(size * .25, size, d) * (h - .55) / .45;
}

// Light beams fanning down from a source above the frame.
float beams(vec2 p, vec2 src, float t, float count) {
  vec2 d = p - src;
  float a = atan(d.x, -d.y);
  float r = .5 + .5 * sin(a * count + t * .3) * sin(a * count * .37 - t * .21);
  return pow(r, 3.) * fall(0., 1.6, length(d));
}
// Slow shafts all round a visible source. n is a whole number so the fan has no seam.
float shafts(vec2 p, vec2 src, float t, float n) {
  vec2 d = p - src;
  float a = atan(d.y, d.x);
  float r = .5 + .5 * sin(a * n + t * .11) * sin(a * (n - 3.) - t * .07);
  return pow(r, 4.) * fall(0., 1.1, length(d));
}
// Rings spreading out from c.
float rings(vec2 p, vec2 c, float t, float speed, float spacing) {
  float d = length(p - c);
  float r = fract((d - t * speed) / spacing);
  return fall(0., .08, abs(r - .5) - .42) * exp(-d * 2.2);
}
`;

const finish = `
void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = (gl_FragCoord.xy - .5 * uRes) / uRes.y;
  // On a narrow (phone) canvas the view pulls back so focal shapes still fit the width.
  p *= clamp(.84 * uRes.y / uRes.x, 1., 1.5);
  p += uPointer * .012;
  vec3 col = scene(p, uv);
  col *= .8 + uIntensity * .55;
  // Vignette, soft tonemap, then grain to hide banding in the dark gradients.
  float vig = fall(.35, 1.25, length((uv - .5) * vec2(1.25, 1.)));
  col *= mix(.45, 1., vig);
  col = col / (1. + col * .35);
  col = pow(max(col, 0.), vec3(.95));
  col += (hash(gl_FragCoord.xy + fract(uTime)) - .5) * .018;
  gl_FragColor = vec4(col, uFade);
}
`;

const scenes = {
  // The Last Light: a far beacon wrapped in slow orbits of light, over drifting haze.
  sanctuary: `
vec3 scene(vec2 p, vec2 uv) {
  vec3 col = mix(uC1 * .3, uC1, smoothstep(-.6, .65, p.y));
  col += uC2 * pow(fbm(p * 1.5 + vec2(uTime * .012, 0.)), 2.4) * 1.1;
  vec2 d = p - vec2(0., .17);
  float r = length(d);
  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    vec2 q = rot(.35 + fi * .42 + uTime * (.012 + fi * .004)) * d;
    q.y *= 2.6 + fi * .5;
    float sweep = .55 + .45 * sin(atan(q.y, q.x) + uTime * .15 + fi * 2.1);
    col += mix(uC3, uC2, fi * .25) * glowLine(length(q) - (.2 + fi * .085), .0011) * sweep * (.7 - fi * .1);
  }
  col += uC3 * shafts(p, vec2(0., .17), uTime, 7.) * .07 * (1. + uPulse);
  col += uC3 * (.012 / (r + .018)) * .5 * (1. + uPulse * .8);
  col += vec3(1., .97, .9) * exp(-r * 110.) * .9;
  col += vec3(stars(p + vec2(uTime * .003, 0.), 60., uTime)) * .6;
  col += uC3 * (drift(p, 9., -.1, uTime, .055, .6, 0., 2.) * .45 + drift(p, 15., -.07, uTime, .05, .4, 0., 7.) * .25);
  float haze = fbm(vec2(p.x * 1.6 - uTime * .02, p.y * 5.));
  col += uC2 * .5 * fall(-.55, -.1, p.y) * haze;
  return col;
}`,

  // The summon gate: turning dashed rings over a spiral of starlight, with a prismatic edge.
  astral: `
vec3 scene(vec2 p, vec2 uv) {
  vec3 col = uC1 * .28;
  vec2 g = p - vec2(0., .04);
  float r = length(g), turn = atan(g.y, g.x) / TAU;
  col += uC2 * pow(fbm(rot(uTime * .008) * p * 2. + 3.), 2.2) * .8;
  float arm = .5 + .5 * sin(turn * TAU * 3. - log(r + .03) * 4.5 - uTime * .07);
  col += mix(uC2, uC3, arm) * pow(arm, 9.) * exp(-r * 3.8) * .4;
  float gate = hairline(r - .24, .0022) * dash(turn * 24. + uTime * .02, .75)
             + glowLine(r - .285, .0008) * .7
             + hairline(r - .33, .0022) * dash(turn * 60. - uTime * .012, .5) * .8
             + hairline(r - .345, .006) * dash(turn * 12. + uTime * .008, .08) * .9;
  col += mix(uC3, hue(turn + r * 1.5 + uTime * .02), .35) * gate * (.5 + uPulse * .9);
  col += hue(turn * 2. + uTime * .015) * exp(-abs(r - .3) * 9.) * .05;
  col += vec3(1., .95, 1.) * exp(-r * 16.) * .5 * (1. + uPulse);
  col += vec3(stars(p, 75., uTime)) * .8 + vec3(stars(p * 1.6 + 4., 48., uTime * 1.2)) * .5;
  col += mix(uC3, vec3(1.), .3) * drift(p, 11., -.06, uTime, .05, .5, 1., 3.) * .4;
  return col;
}`,

  // Prismatica vault: slow crystal facets hanging in the dark.
  vault: `
vec3 scene(vec2 p, vec2 uv) {
  vec3 col = mix(uC1 * .3, uC1, smoothstep(-.6, .6, p.y));
  col += uC2 * pow(fbm(p * 1.4 + uTime * .01), 2.2) * 1.2;
  for (int i = 0; i < 14; i++) {
    float fi = float(i);
    vec2 c = (vec2(hash1(fi * 1.7), hash1(fi * 5.3)) - .5) * vec2(1.9, 1.1);
    c += vec2(sin(uTime * .04 + fi), cos(uTime * .03 + fi * 1.7)) * .08;
    float size = .05 + hash1(fi * 9.1) * .13;
    vec2 q = rot(.2 * sin(uTime * .05 + fi)) * (p - c);
    float d = abs(q.x) * 1.25 + abs(q.y) * .8;
    float facet = .7 + .3 * sign(q.x) * sign(q.y);
    vec3 tone = mix(uC2, uC3, hash1(fi * 3.3));
    float sheen = .6 + .4 * sin(uTime * .35 + fi * 2.4 + q.y * 9.);
    col += tone * (fall(size * .82, size, d) * .2 * facet * sheen + glowLine(d - size * .9, .0012) * .42) * (.45 + .55 * hash1(fi * 2.2));
  }
  col += vec3(stars(p, 70., uTime)) * .5;
  col += uC3 * drift(p, 12., -.05, uTime, .045, .5, 0., 4.) * .25;
  return col;
}`,

  // The world to cross: ridgelines under an aurora, each ridge keeping a far beacon.
  expanse: `
float ridge(float x, float layer) {
  return -.16 - .09 * layer + .07 * fbm3(vec2(x * (2. + layer) + layer * 7., layer)) + .02 * sin(x * 3. + layer * 2.);
}
vec3 scene(vec2 p, vec2 uv) {
  vec3 col = mix(uC2 * .8, uC1, smoothstep(-.2, .6, p.y));
  float au = fbm(vec2(p.x * 1.4 + uTime * .025, p.y * .9));
  float curtain = .5 + .5 * sin(p.x * 9. + au * 6. + uTime * .1);
  col += uC3 * smoothstep(.36, .72, au) * smoothstep(-.05, .4, p.y) * (.3 + .3 * curtain);
  col += vec3(stars(p, 65., uTime)) * .6 * smoothstep(-.05, .35, p.y);
  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    float x = (fi - 2.) * .31 + .05 * sin(fi * 4.);
    vec2 d = p - vec2(x, ridge(x, 0.) + .012);
    float lit = .6 + .4 * sin(uTime * .5 + fi * 1.9);
    col += uC3 * (.0016 / (length(d) + .004)) * lit * (1. + uPulse);
    col += uC3 * exp(-abs(d.x) * 150.) * smoothstep(0., .02, d.y) * fall(.02, .5, d.y) * .12 * lit;
  }
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    float h = ridge(p.x, fi);
    col = mix(col, mix(uC1, uC2, .55 - .2 * fi) * (.5 - .15 * fi), fall(h, h + .004, p.y));
    float mist = fbm(vec2(p.x * 2. - uTime * (.015 + .01 * fi), p.y * 6. + fi * 3.));
    col += uC2 * .45 * mist * fall(0., .1, abs(p.y - h + .05));
  }
  col += uC3 * drift(p, 12., -.05, uTime, .045, .6, 0., 5.) * .3;
  return col;
}`,

  // Infernic: heat rising off cooling glass, embers lifting away.
  ember: `
vec3 scene(vec2 p, vec2 uv) {
  vec3 col = mix(uC1 * .7, uC1 * .2, smoothstep(-.6, .6, p.y));
  float low = fall(-.6, .25, p.y);
  vec2 fp = vec2(p.x * 2., p.y * 1.5 - uTime * .22);
  float fl = fbm(fp + fbm(fp * 1.4 + uTime * .08) * .9);
  float veil = smoothstep(.5, .95, fl * (.45 + low));
  float fine = fbm(fp * 3. + fl * 2.);
  col += mix(uC2 * 1.5, uC3, veil * veil) * veil * (.35 + .5 * fine) * low;
  col += uC2 * .45 * low * low * (1. + uPulse * .5);
  col += uC3 * glowLine(fbm(p * 2.6 + vec2(0., uTime * .02)) - .5, .003) * low * .2;
  float embers = drift(p, 10., -.3, uTime, .05, .8, 3., 0.) + drift(p, 17., -.45, uTime, .045, .6, 0., 4.) * .7;
  col += mix(uC3, vec3(1., .93, .7), .4) * embers * 1.1;
  return col;
}`,

  // Oceanic: beneath the surface, light falling through a moving net of caustics.
  tide: `
vec3 scene(vec2 p, vec2 uv) {
  vec3 col = mix(uC1 * .25, uC1, smoothstep(-.6, .6, p.y));
  col += uC2 * .6 * smoothstep(-.1, .6, p.y);
  col += uC3 * beams(p, vec2(.15, .95), uTime, 9.) * .34 * (1. + uPulse * .6);
  vec2 c = p * vec2(3., 4.5) + vec2(uTime * .05, -uTime * .03);
  float net = glowLine(fbm(c + fbm(c * 1.3 - uTime * .04) * .8) - .5, .012);
  col += uC3 * net * .2 * smoothstep(-.5, .5, p.y);
  float bubbles = drift(p, 8., -.14, uTime, .06, .9, 0., 1.) + drift(p, 14., -.2, uTime, .05, .6, 0., 6.) * .6;
  col += mix(uC3, vec3(.9, .97, 1.), .5) * bubbles * .4;
  col += uC2 * .18 * fall(-.55, -.2, p.y) * fbm(vec2(p.x * 2. - uTime * .015, p.y * 4.));
  return col;
}`,

  // Atmospheric: racing cloud bands, wind streaks and soft far lightning.
  gale: `
vec3 scene(vec2 p, vec2 uv) {
  vec3 col = mix(uC1 * .35, uC1, smoothstep(-.6, .6, p.y));
  float band = fbm(vec2(p.x * 1.1 + uTime * .05, p.y * 3.2 + sin(p.x * 1.5 + uTime * .05) * .2));
  float far = fbm(vec2(p.x * 2.2 + uTime * .09, p.y * 6. + 4.));
  col = mix(col, uC2 * 1.3, smoothstep(.42, .75, band) * .7);
  col += uC3 * smoothstep(.5, .8, far) * smoothstep(.4, .75, band) * .12;
  float streak = noise(vec2(p.x * 2.2 - uTime * .7, p.y * 110.)) * noise(vec2(p.x * 5. - uTime * 1.6, p.y * 9.));
  col += uC3 * pow(streak, 5.) * 1.1 * smoothstep(.35, .7, band);
  float tick = floor(uTime * .5);
  float flash = step(.72, hash1(tick)) * exp(-fract(uTime * .5) * 5.);
  vec2 at = vec2(hash1(tick + 3.) - .5, hash1(tick + 9.) * .4) * vec2(1.2, 1.);
  col += mix(uC3, vec3(1.), .4) * exp(-length((p - at) * vec2(1., 2.2)) * 4.) * flash * .35 * band;
  col += uC3 * drift(rot(1.25) * p, 10., .5, uTime, .05, .5, 3., 2.) * .5;
  col += vec3(stars(p, 60., uTime)) * .35 * smoothstep(.1, .5, p.y) * (1. - band);
  return col;
}`,

  // Botanic: light through a canopy, leaves and pollen on slow air.
  grove: `
vec3 scene(vec2 p, vec2 uv) {
  vec3 col = mix(uC1 * .25, uC1 * .9, smoothstep(-.6, .6, p.y));
  col += uC2 * pow(fbm(p * 2.2 + vec2(uTime * .02, uTime * .01)), 2.) * 1.3;
  col += uC3 * beams(p, vec2(-.3, .95), uTime, 8.) * .4 * (1. + uPulse * .6);
  float canopy = .36 + .07 * fbm3(vec2(p.x * 3. + 1., 2.)) + .03 * sin(p.x * 7. + uTime * .2);
  col = mix(col, uC1 * .1, smoothstep(canopy - .01, canopy + .05, p.y) * .85);
  float leaves = drift(p, 6., .09, uTime, .11, 1.3, 2., 0.) * .8 + drift(p, 10., .13, uTime, .09, 1., 2., 5.) * .5;
  col += mix(uC3, uC2, .4) * leaves * .5;
  col += mix(uC3, vec3(1., 1., .8), .5) * drift(p, 13., -.05, uTime, .045, .7, 0., 9.) * .5;
  col += uC2 * .2 * fall(-.55, -.25, p.y) * fbm(vec2(p.x * 1.8 + uTime * .02, p.y * 5.));
  return col;
}`,

  // Tranquilitic: a pale ring of light over still water, ripples spreading without hurry.
  stillness: `
vec3 scene(vec2 p, vec2 uv) {
  float horizon = -.08;
  vec2 orb = vec2(0., .24);
  float od = length(p - orb);
  vec3 col;
  if (p.y > horizon) {
    col = mix(uC2 * .7, uC1, smoothstep(horizon, .6, p.y));
    col += vec3(stars(p, 65., uTime)) * .5 * smoothstep(horizon, .4, p.y);
    col += mix(uC3, vec3(1.), .5) * glowLine(od - .09, .0012) * .5;
    col += uC3 * fall(0., .09, od) * .1;
  } else {
    float depth = horizon - p.y;
    col = mix(uC1 * .45, uC1 * .12, smoothstep(0., .4, depth));
    float ripple = sin(length(vec2(p.x, depth * 3.4)) * 42. - uTime * .9);
    col += uC3 * pow(.5 + .5 * ripple, 14.) * exp(-depth * 4.5) * smoothstep(0., .05, depth) * .17;
    float glint = .6 + .4 * noise(vec2(p.x * 20., depth * 90. - uTime));
    col += uC3 * exp(-abs(p.x) * (7. + depth * 30.)) * .2 * glint;
  }
  col += uC3 * (.02 / (od + .03)) * .3 * (1. + uPulse * .7);
  float mist = fbm(vec2(p.x * 1.8 + uTime * .015, p.y * 5.));
  col += uC2 * .55 * fall(0., .16, abs(p.y - horizon)) * (.35 + mist);
  col += mix(uC3, vec3(1.), .4) * drift(p, 9., -.04, uTime, .05, .7, 0., 3.) * .3;
  return col;
}`,

  // Chaotic: smoke folding in on itself around a seam of bright fractures.
  rift: `
vec3 scene(vec2 p, vec2 uv) {
  vec2 q = vec2(fbm(p * 1.5 + uTime * .03), fbm(p * 1.5 + vec2(5.2, 1.3) - uTime * .025));
  float f = fbm(p * 1.6 + 2.6 * q);
  vec3 col = mix(uC1 * .3, uC2 * 1.5, f * f * 1.3);
  float crack = glowLine(fbm3(p * 2.2 + q * 1.5) - .5, .003);
  float seam = exp(-abs(p.x * .6 + (f - .5) * .5 - p.y * .25) * 5.);
  col += uC3 * crack * .42 * (.3 + seam) * (1. + uPulse);
  col += uC3 * seam * f * .14;
  col += mix(uC3, vec3(1.), .3) * drift(p, 7., -.05, uTime, .1, 1., 1., 2.) * .35;
  col *= .65 + .35 * fall(.1, 1.1, length(p));
  return col;
}`,
} as const;

export type SceneId = keyof typeof scenes;
export const sceneIds = Object.keys(scenes) as SceneId[];

export function sceneFragment(id: SceneId): string {
  return `${prelude}${scenes[id]}${finish}`;
}
