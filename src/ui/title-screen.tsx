import { useEffect, useRef } from 'react';
import { Button, Icon } from './components';
import { lusterSheen, staggerIn } from '../presentation/luster';

export function TitleScreen({ onOffline, onOnline }: {
  onOffline: () => void; onOnline: () => void;
}) {
  const controls = useRef<HTMLDivElement>(null);
  const identity = useRef<HTMLDivElement>(null);
  const name = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    // One finite entrance on mount (D-463); both helpers are no-ops under Reduce motion.
    const stops: Array<() => void> = [];
    if (identity.current) stops.push(staggerIn(identity.current, undefined, { stepMs: 90, durationMs: 520 }));
    if (controls.current) stops.push(staggerIn(controls.current, undefined, { stepMs: 120, durationMs: 520 }));
    if (name.current) stops.push(lusterSheen(name.current, 1400));
    return () => stops.forEach(stop => stop());
  }, []);
  return <section className="ll-ui ll-title" aria-label="Last Light">
    <div ref={identity} className="ll-title-identity"><p className="ll-kicker">WHEN ALL ELSE FADES</p>
      <svg className="ll-title-emblem" viewBox="0 0 40 80" aria-hidden="true"><path fill="currentColor" d="m20 0 5 29 15 11-15 11-5 29-5-29L0 40l15-11Z" /></svg>
      <h1 ref={name} className="ll-title-name" tabIndex={-1}>LAST<span>LIGHT</span></h1>
      <p className="ll-title-subtitle">Carry a spark into the unknown.</p>
    </div>
    <div ref={controls} className="ll-title-controls"><div className="ll-title-play">
      <Button id="online-account-open" tone="primary" onClick={onOnline}>Sign-in / Create Account<Icon name="arrow" /></Button>
      <Button id="enter" onClick={onOffline}>Play Offline</Button>
    </div>
      <p className="ll-title-note">Your story begins with one Element-Bearer.</p>
    </div>
  </section>;
}
