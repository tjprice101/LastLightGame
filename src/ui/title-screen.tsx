import { Button, Icon } from './components';

export function TitleScreen({ onOffline, onOnline, onPlayerInfo }: {
  onOffline: () => void; onOnline: () => void; onPlayerInfo: () => void;
}) {
  return <section className="ll-ui ll-title" aria-label="Last Light">
    <div className="ll-title-identity"><p className="ll-kicker">WHEN ALL ELSE FADES</p>
      <svg className="ll-title-emblem" viewBox="0 0 40 80" aria-hidden="true"><path fill="currentColor" d="m20 0 5 29 15 11-15 11-5 29-5-29L0 40l15-11Z" /></svg>
      <h1 className="ll-title-name" tabIndex={-1}>LAST<span>LIGHT</span></h1>
      <p className="ll-title-subtitle">Carry a spark into the unknown.</p>
    </div>
    <div className="ll-title-controls"><div className="ll-title-play">
      <Button id="online-account-open" tone="primary" onClick={onOnline}>Play Online<Icon name="arrow" /></Button>
      <Button id="enter" onClick={onOffline}>Play Offline</Button>
    </div><Button onClick={onPlayerInfo}>Player info</Button>
      <p className="ll-title-note">Your story begins with one Element-Bearer.</p>
    </div>
  </section>;
}
