import type { BaseVFXSystem, VFXContext } from './types';

export function smoothstep(value: number): number {
  const x = Math.max(0, Math.min(1, value));
  return x * x * (3 - 2 * x);
}

export function effectOpacity(time: number, duration: number): number {
  return smoothstep(time / .09) * smoothstep((duration - time) / .35);
}

export function releaseEnvelope(age: number, duration: number, rise = .045): number {
  if (age < 0 || age >= duration) return 0;
  return smoothstep(age / rise) * Math.pow(1 - age / duration, 1.5);
}

export function advanceVFX(system: BaseVFXSystem, context: VFXContext, time: number): void {
  // Small simulation steps keep emission, drag and flight consistent at 1x-3x.
  while (time - context.t > .000001) {
    context.dt = Math.min(1 / 120, time - context.t);
    context.t += context.dt;
    context.progress = Math.min(1, context.t / context.definition.duration);
    system.update(context);
  }
}
