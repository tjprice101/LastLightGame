import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { availableStarters, type StarterId } from '../content/starters';
import { characterName } from '../content/character-art';
import { portraitAttributes, characterFacing } from '../presentation/portrait';
import { characterRating } from '../presentation/character-rating';
import { elementalReveal } from '../presentation/reveal';
import { lusterSheen, staggerIn } from '../presentation/luster';
import { Button, Icon } from './components';
import '../styles/starter-selection.css';

type OpeningStarterId = (typeof availableStarters)[number]['id'];

export function StarterSelection({ initialSelected, onSelect, onBegin, onPlayerInfo }: {
  initialSelected?: StarterId;
  onSelect: (id: OpeningStarterId) => void;
  onBegin: () => Promise<void>;
  /** Omitted for signed-in online accounts, whose save data is managed by the server. */
  onPlayerInfo?: () => void;
}) {
  const [selected, setSelected] = useState(() => availableStarters.find(starter => starter.id === initialSelected));
  const [busy, setBusy] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const grid = useRef<HTMLDivElement>(null);
  const detail = useRef<HTMLElement>(null);

  // Cards cascade in once on mount (D-463); a no-op under Reduce motion.
  useEffect(() => (grid.current ? staggerIn(grid.current, '.ll-starter-card', { stepMs: 90, durationMs: 460 }) : undefined), []);
  // One gold sheen over the detail panel when the player picks a starter (never on restore, busy or failure).
  useEffect(() => (revealed && detail.current ? lusterSheen(detail.current, 900) : undefined), [revealed, selected?.id]);

  return <section className="ll-ui ll-starter-selection" aria-busy={busy}>
    <header className="ll-starter-heading">
      <div><p className="ll-kicker">CHAPTER ZERO · A FIRST LIGHT</p>
        <h1 tabIndex={-1}>Choose your Element-Bearer</h1>
        <p>Pick a starter. Compare their roles, then begin.</p></div>
      {onPlayerInfo && <Button onClick={onPlayerInfo} disabled={busy}>Player info</Button>}
    </header>
    <div className="ll-starter-layout">
      <div className="ll-starter-choices">
        <div className="ll-starter-shared-rating" dangerouslySetInnerHTML={{ __html: characterRating('ember') }} />
        <div ref={grid} className="ll-starter-grid" role="group" aria-label="Starter Element-Bearers">
          {availableStarters.map(starter => {
            const active = selected?.id === starter.id;
            const facing = characterFacing(starter.id);
            return <button key={starter.id} type="button" className="ll-starter-card" data-starter={starter.id}
              aria-pressed={active} disabled={busy} style={{ '--element': starter.color } as CSSProperties}
              onClick={() => {
                if (active) return;
                onSelect(starter.id);
                setSelected(starter);
                setRevealed(true);
              }}>
              <span className="ll-starter-element">{starter.element}</span>
              <span className="ll-starter-portrait">
                <span className="character-idle" data-character={starter.id}>
                  <img {...portraitAttributes(starter)} data-facing={facing.facing} data-mirrored={facing.mirrored}
                    draggable={false} width={960} height={960} />
                </span>
                {active && revealed && <span className="reveal-slot" dangerouslySetInnerHTML={{ __html: elementalReveal(starter) }} />}
              </span>
              <strong>{characterName(starter.id)}</strong>
              <span className="ll-starter-role">{starter.role}</span>
              <span className="ll-starter-weapon">{starter.weapon}</span>
              <span className="ll-starter-mark">{active ? 'Selected' : 'Choose'}</span>
            </button>;
          })}
        </div>
        <p className="ll-starter-note">Lv.0 starters. Your choice becomes your squad leader.</p>
      </div>
      <aside ref={detail} className="ll-starter-detail" style={{ '--element': selected?.color ?? 'var(--text-muted)' } as CSSProperties}>
        <div aria-live="polite" aria-atomic="true">
          <p className="ll-kicker">{selected ? `${selected.element} · ${selected.role}` : 'Your first light'}</p>
          <h2>{selected ? characterName(selected.id) : 'Select a starter'}</h2>
          <p className="ll-starter-summary">{selected ? selected.title : 'Choose Infernis, Tizu, or Flora to see their story.'}</p>
        </div>
        <Button id="begin" tone="primary" disabled={!selected || busy} onClick={async () => {
          if (!selected || busy) return;
          setBusy(true);
          try { await onBegin(); }
          finally { setBusy(false); }
        }}>{busy ? 'Beginning journey…' : 'Begin your journey'}<Icon name="arrow" /></Button>
        {selected && <details className="ll-starter-story" key={selected.id}>
          <summary>Read {selected.name}'s story</summary>
          <p>{selected.lore.awakening}</p>
          <p className="ll-kicker">{selected.lore.origin}</p>
          <p>{selected.lore.story}</p>
          <blockquote>“{selected.lore.vow}”</blockquote>
        </details>}
      </aside>
    </div>
  </section>;
}
