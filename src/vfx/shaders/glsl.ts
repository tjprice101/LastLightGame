/**
 * Battle Spectacle shader kit (D-494): original GLSL written for Last Light.
 * Three fragment programs run as one camera post pass over the transparent
 * GPU layer (spectacle-pipeline.ts):
 *   threshold -> blur (separable) -> composite (scene + bloom + light overlays).
 *
 * Overlays are procedural (no textures): screen-edge bloom, god rays, the
 * chromatic critical-hit ring and six element veils. They add light over the
 * page; they cannot warp the DOM cutouts underneath.
 *
 * Positions are canvas pixels with a top-left origin. Slot counts must match
 * `fxSlots` in spectacle-fx.ts (checked by glsl.test.ts).
 */
const precision = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 outFragCoord;
varying vec2 outTexCoord;
uniform sampler2D uMainSampler;
`;

/** Keeps only light above the threshold (soft knee), written at half size. */
export const thresholdFrag = `#define SHADER_NAME LAST_LIGHT_BLOOM_THRESHOLD
${precision}
uniform float uThreshold;
uniform float uKnee;
void main() {
  vec4 texel = texture2D(uMainSampler, outTexCoord);
  float light = max(texel.r, max(texel.g, texel.b));
  gl_FragColor = texel * smoothstep(uThreshold, uThreshold + uKnee, light);
}
`;

/** One direction of a 9-tap Gaussian (five bilinear fetches). `uStep` is the texel step times the spread. */
export const blurFrag = `#define SHADER_NAME LAST_LIGHT_BLOOM_BLUR
${precision}
uniform vec2 uStep;
void main() {
  vec4 sum = texture2D(uMainSampler, outTexCoord) * .227027;
  sum += texture2D(uMainSampler, outTexCoord + uStep * 1.384615) * .316216;
  sum += texture2D(uMainSampler, outTexCoord - uStep * 1.384615) * .316216;
  sum += texture2D(uMainSampler, outTexCoord + uStep * 3.230769) * .070270;
  sum += texture2D(uMainSampler, outTexCoord - uStep * 3.230769) * .070270;
  gl_FragColor = sum;
}
`;

export const compositeFrag = `#define SHADER_NAME LAST_LIGHT_SPECTACLE_COMPOSITE
${precision}
uniform sampler2D uBloomSampler;
uniform vec2 uResolution;
uniform float uTime;
uniform float uBloom;
// Page cover per kind of light: edge, rays, critical ring, veil.
uniform vec4 uBody;
uniform float uOctaves;
uniform float uFlipY;
// Edge bloom: rect (x, y, w, h); color (rgb, intensity); shape (reach px, streaks, seed, white rim).
uniform vec4 uEdgeRect[2];
uniform vec4 uEdgeColor[2];
uniform vec4 uEdgeShape[2];
// God rays: A (x, y, radius, intensity); B (density, spin, seed, core); color (rgb, unused).
uniform vec4 uRayA;
uniform vec4 uRayB;
uniform vec4 uRayColor;
// Critical-hit ring: A (x, y, radius, intensity); B (thickness, color split px, seed, centre flash).
uniform vec4 uCritA[3];
uniform vec4 uCritB[3];
uniform vec4 uCritColor[3];
// Element veil: A (x, y, radius, intensity); B (mode, progress, seed, unused); three palette tones.
uniform vec4 uVeilA[4];
uniform vec4 uVeilB[4];
uniform vec4 uVeilCore[4];
uniform vec4 uVeilMain[4];
uniform vec4 uVeilEdge[4];

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 cell = floor(p), f = fract(p);
  vec2 u = f * f * (3. - 2. * f);
  return mix(mix(hash(cell), hash(cell + vec2(1., 0.)), u.x),
             mix(hash(cell + vec2(0., 1.)), hash(cell + vec2(1., 1.)), u.x), u.y);
}
// Normalised to 0..1 around .5 whatever the octave count, so low quality keeps the same shapes.
float fbm(vec2 p) {
  float weight = .5, sum = 0.;
  for (int i = 0; i < 4; i++) {
    if (float(i) >= uOctaves) break;
    sum += weight * noise(p);
    p = p * 2.03 + vec2(17.1, 9.2);
    weight *= .5;
  }
  return sum / (1. - 2. * weight);
}
float peak(vec3 c) { return max(c.r, max(c.g, c.b)); }
float band(float value, float centre, float width) {
  float x = (value - centre) / width;
  return exp(-x * x);
}

// Light pouring in from the four edges of a rect; noise makes the reach breathe along each edge.
vec3 edgeLight(vec2 p, vec4 rect, vec4 color, vec4 shape) {
  if (color.a <= .001) return vec3(0.);
  vec2 q = p - rect.xy;
  if (q.x < 0. || q.y < 0. || q.x > rect.z || q.y > rect.w) return vec3(0.);
  float reach = max(shape.x, 1.);
  float alongX = fbm(vec2(q.x * .014 + shape.z, uTime * 1.1 + shape.z * 3.1));
  float alongY = fbm(vec2(q.y * .014 + shape.z + 7.7, uTime * 1.1 + 4.2));
  float reachX = reach * mix(1., .3 + 1.5 * alongX, shape.y);
  float reachY = reach * mix(1., .3 + 1.5 * alongY, shape.y);
  // Brighter fingers of light where the reach is long, dimmer gaps between them.
  float fingerX = mix(1., .35 + 1.5 * alongX * alongX, shape.y);
  float fingerY = mix(1., .35 + 1.5 * alongY * alongY, shape.y);
  float glow = (exp(-3. * q.y / reachX) + exp(-3. * (rect.w - q.y) / reachX)) * fingerX
             + (exp(-3. * q.x / reachY) + exp(-3. * (rect.z - q.x) / reachY)) * fingerY;
  float inset = min(min(q.x, rect.z - q.x), min(q.y, rect.w - q.y));
  float rim = exp(-inset / (reach * .1));
  vec3 tone = mix(color.rgb, vec3(1.), clamp(rim * shape.w, 0., 1.));
  return tone * (glow * 1.1 + rim * .9) * color.a;
}

// Two counter-turning layers of light shafts around a white-hot core.
vec3 rayLight(vec2 p) {
  if (uRayA.w <= .001) return vec3(0.);
  vec2 v = p - uRayA.xy;
  float radius = max(uRayA.z, 1.);
  float r = length(v) / radius;
  if (r >= 1.) return vec3(0.);
  float angle = atan(v.y, v.x);
  float a1 = angle + uTime * uRayB.y;
  float a2 = angle - uTime * uRayB.y * .6 + 1.7;
  float n1 = noise(vec2(cos(a1), sin(a1)) * uRayB.x + uRayB.z);
  float n2 = noise(vec2(cos(a2), sin(a2)) * uRayB.x * 1.9 + uRayB.z + 31.);
  float shafts = smoothstep(.5, .8, n1) + .6 * smoothstep(.58, .86, n2);
  float fall = pow(1. - r, 1.2);
  float core = exp(-r * 13.) * uRayB.w;
  float beams = shafts * fall * (.35 + .65 * smoothstep(0., .1, r));
  vec3 tone = mix(uRayColor.rgb, vec3(1.), clamp(core + beams * .15, 0., 1.));
  return tone * (beams + core) * uRayA.w;
}

// A shock ring whose red, green and blue bands sit at slightly different radii.
vec3 critLight(vec2 p, vec4 a, vec4 b, vec4 color) {
  if (a.w <= .001) return vec3(0.);
  vec2 v = p - a.xy;
  float dist = length(v);
  if (dist > a.z + b.x * 3. + b.y * 2.) return vec3(0.);
  vec3 ring = vec3(band(dist, a.z - b.y, b.x), band(dist, a.z, b.x), band(dist, a.z + b.y, b.x));
  float angle = atan(v.y, v.x);
  float spokes = pow(noise(vec2(cos(angle), sin(angle)) * 7. + b.z), 5.) * 6.;
  float inside = 1. - smoothstep(a.z * .35, a.z + b.x, dist);
  float streak = spokes * inside * smoothstep(0., a.z * .25, dist);
  float flash = exp(-dist / max(a.z * .22, 1.)) * b.w;
  vec3 tint = mix(vec3(1.), color.rgb, .35);
  return (ring * tint * 1.2 + tint * streak * .5 + vec3(flash)) * a.w;
}

// Six element languages inside a soft disc. Mode order matches veilModes in spectacle-fx.ts.
vec3 veilLight(vec2 p, vec4 a, vec4 b, vec3 core, vec3 main, vec3 edge) {
  if (a.w <= .001) return vec3(0.);
  vec2 uv = (p - a.xy) / max(a.z, 1.);
  float r = length(uv);
  if (r >= 1.) return vec3(0.);
  float t = uTime, progress = b.y, seed = b.z;
  float mask = 1. - smoothstep(.5, 1., r);
  float angle = atan(uv.y, uv.x);
  vec3 light = vec3(0.);
  if (b.x < .5) {
    // Infernic: heat shimmer. Wavering tongues rise; the hottest threads go white.
    float waver = sin(uv.y * 7. + t * 6. + seed) * .12;
    float n = fbm(vec2((uv.x + waver) * 3.2 + seed, uv.y * 2.2 + t * 2.6));
    float tongue = smoothstep(.46, .8, n);
    float low = .55 + .45 * smoothstep(-1., .8, uv.y);
    light = (mix(main, core, smoothstep(.6, .9, n)) * 1.25 + edge * .3) * tongue * low;
  } else if (b.x < 1.5) {
    // Oceanic: ripples spread over a flattened disc, with caustic glints.
    vec2 e = vec2(uv.x, uv.y * 1.7);
    float n = fbm(e * 2.4 + seed);
    float rings = pow(.5 + .5 * sin(length(e) * 16. - t * 7. + n * 3.), 8.);
    float caustic = smoothstep(.55, .9, fbm(e * 4. + vec2(t * .7, -t * .5) + seed));
    light = mix(main, core, rings * .6) * rings + edge * caustic * .6 + core * caustic * .15;
  } else if (b.x < 2.5) {
    // Atmospheric: thin arcs that re-strike sixteen times a second.
    float tick = floor(t * 16.);
    float jitter = hash(vec2(tick, seed));
    float n1 = fbm(uv * 2.6 + vec2(seed + jitter * 9., tick * .37));
    float n2 = fbm(uv * 4.1 + vec2(tick * .21, seed + 5.));
    float arc = 1. - smoothstep(0., .035, abs(n1 - .5));
    float fine = 1. - smoothstep(0., .02, abs(n2 - .5));
    light = (core * arc + main * fine * .7 + edge * n1 * .12) * (.55 + .45 * step(.35, jitter));
  } else if (b.x < 3.5) {
    // Botanic: twinkling motes drift up through a slow green swirl.
    vec2 grid = uv * 4.5 + vec2(sin(t * .9 + seed) * .35, t * .55);
    vec2 cell = floor(grid);
    vec2 offset = vec2(hash(cell + seed), hash(cell + seed + 19.7)) - .5;
    float twinkle = .5 + .5 * sin(t * 5. + hash(cell) * 6.2832);
    float mote = (1. - smoothstep(0., .2, length(fract(grid) - .5 - offset * .55))) * twinkle;
    float swirl = .5 + .5 * sin(angle * 3. + r * 7. - t * 2. + seed);
    float haze = fbm(uv * 2. + seed + vec2(0., t * .3)) * swirl;
    light = mix(main, core, mote) * mote * 1.4 + main * haze * .5 + edge * haze * .15;
  } else if (b.x < 4.5) {
    // Tranquilitic: calm concentric rings of dashes and ticks, turning against each other.
    float turn = 6.2832;
    float inner = band(r, .34 + progress * .05, .016) * step(.3, fract(angle * 6. / turn + t * .25));
    float middle = band(r, .6, .012);
    float outer = band(r, .82, .02) * step(.5, fract(angle * 16. / turn - t * .18));
    float ticks = band(r, .71, .05) * (1. - smoothstep(0., .12, abs(fract(angle * 12. / turn + t * .1) - .5)));
    float breath = .75 + .25 * sin(t * 3. + seed);
    light = (main * (inner + outer) + core * (middle * .9 + ticks * .8) + edge * (1. - r) * .25) * breath;
  } else {
    // Chaotic: cracks race outward with progress while smoke churns behind them.
    float n1 = fbm(uv * 3.2 + seed);
    float n2 = noise(uv * 7. + seed * 1.7);
    float crack = pow(1. - smoothstep(0., .05, abs(n1 - .5)), 2.)
                + pow(1. - smoothstep(0., .04, abs(n2 - .5)), 2.) * .5;
    float grown = smoothstep(r - .25, r, progress * 1.6);
    float smoke = fbm(uv * 2.3 + vec2(t * .45, -t * .3) + seed + 11.);
    light = core * crack * grown + mix(edge, main, smoke) * smoothstep(.35, .8, smoke) * .6;
  }
  return light * mask * a.w;
}

void main() {
  vec2 p = vec2(outFragCoord.x, mix(outFragCoord.y, 1. - outFragCoord.y, uFlipY)) * uResolution;
  vec4 scene = texture2D(uMainSampler, outTexCoord);
  vec4 bloom = texture2D(uBloomSampler, outTexCoord);
  vec3 rays = rayLight(p), edges = vec3(0.), crits = vec3(0.), veils = vec3(0.);
  for (int i = 0; i < 2; i++) edges += edgeLight(p, uEdgeRect[i], uEdgeColor[i], uEdgeShape[i]);
  for (int i = 0; i < 3; i++) crits += critLight(p, uCritA[i], uCritB[i], uCritColor[i]);
  for (int i = 0; i < 4; i++)
    veils += veilLight(p, uVeilA[i], uVeilB[i], uVeilCore[i].rgb, uVeilMain[i].rgb, uVeilEdge[i].rgb);
  // Soft clip keeps hue when overlays stack.
  vec3 light = 1. - exp(-(rays + edges + crits + veils));
  // Colors add over the page. Cover (alpha) lets a color hold its hue on bright backgrounds
  // instead of washing out to white; sparkle-like light (the critical ring) covers least.
  float cover = 1. - exp(-(peak(edges) * uBody.x + peak(rays) * uBody.y + peak(crits) * uBody.z + peak(veils) * uBody.w));
  vec3 rgb = scene.rgb + bloom.rgb * uBloom + light;
  float alpha = scene.a + bloom.a * uBloom * .5 + cover;
  gl_FragColor = vec4(rgb, clamp(alpha, 0., 1.));
}
`;
