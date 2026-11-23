/**
 * Battle Spectacle shader kit pipeline (D-494): one camera post pass over the
 * transparent GPU layer. Thresholds and blurs the scene at half size for
 * bloom, then composites scene + bloom + the light overlays held in
 * SpectacleFxState. Shader sources: glsl.ts.
 */
import Phaser from 'phaser';
import { blurFrag, compositeFrag, thresholdFrag } from './glsl';
import { bloomSettings, lightBody, type FxView, type SpectacleFxState } from './spectacle-fx';

export const spectaclePipelineKey = 'LastLightSpectacleFx';

export class SpectacleFxPipeline extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
  /** Set by the scene after the camera creates this pipeline. */
  fx: SpectacleFxState | null = null;
  fxView: (() => FxView) | null = null;

  constructor(game: Phaser.Game) {
    super({ game, name: spectaclePipelineKey, shaders: [
      { name: 'composite', fragShader: compositeFrag },
      { name: 'threshold', fragShader: thresholdFrag },
      { name: 'blur', fragShader: blurFrag },
    ] });
  }

  onDraw(source: Phaser.Renderer.WebGL.RenderTarget): void {
    const fx = this.fx, view = this.fxView?.();
    if (!fx || !view) { this.bindAndDraw(source); return; }
    const gl = this.gl, renderer = this.renderer;
    const [composite, threshold, blur] = this.shaders;
    const half = this.halfFrame1, scratch = this.halfFrame2;
    const settings = bloomSettings[fx.quality];
    // Premultiplied "normal": a copy into each cleared target, and the page-ready result on the canvas.
    renderer.setBlendMode(Phaser.BlendModes.NORMAL, true);

    this.set1f('uThreshold', settings.threshold, threshold);
    this.set1f('uKnee', settings.knee, threshold);
    this.bindAndDraw(source, half, true, true, threshold);
    for (const spread of settings.spreads) {
      this.set2f('uStep', spread / half.width, 0, blur);
      this.bindAndDraw(half, scratch, true, true, blur);
      this.set2f('uStep', 0, spread / half.height, blur);
      this.bindAndDraw(scratch, half, true, true, blur);
    }

    const u = fx.pack(view);
    this.set2f('uResolution', view.width, view.height, composite);
    this.set1f('uTime', u.time, composite);
    this.set1f('uBloom', settings.strength, composite);
    this.set4f('uBody', lightBody[0], lightBody[1], lightBody[2], lightBody[3], composite);
    this.set1f('uOctaves', settings.octaves, composite);
    this.set1f('uFlipY', 1, composite);
    this.set4fv('uEdgeRect', u.edgeRect, composite);
    this.set4fv('uEdgeColor', u.edgeColor, composite);
    this.set4fv('uEdgeShape', u.edgeShape, composite);
    this.set4fv('uRayA', u.rayA, composite);
    this.set4fv('uRayB', u.rayB, composite);
    this.set4fv('uRayColor', u.rayColor, composite);
    this.set4fv('uCritA', u.critA, composite);
    this.set4fv('uCritB', u.critB, composite);
    this.set4fv('uCritColor', u.critColor, composite);
    this.set4fv('uVeilA', u.veilA, composite);
    this.set4fv('uVeilB', u.veilB, composite);
    this.set4fv('uVeilCore', u.veilCore, composite);
    this.set4fv('uVeilMain', u.veilMain, composite);
    this.set4fv('uVeilEdge', u.veilEdge, composite);
    this.set1i('uBloomSampler', 1, composite);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, half.texture.webGLTexture);
    this.bindAndDraw(source, undefined, true, true, composite);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.activeTexture(gl.TEXTURE0);
  }
}
