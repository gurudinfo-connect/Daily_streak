import React from 'react';
import { Check, Lock } from 'lucide-react';
import v from './Streak.module.css';
import { CrownIcon } from '../../components/icons/VLIcons.jsx';

// Visual path of the whole cycle, driven by each reward's real status.
export default function Journey({ rewards }) {
  return (
    <section className={v.journey} aria-label="Your streak journey">
      <ol className={v.track}>
        {rewards.map((r, i) => {
          const done = r.status === 'CLAIMED';
          const current = r.status === 'AVAILABLE' || r.status === 'TODAY';
          return (
            <li key={r.day} className={`${v.node} ${done ? v.nodeDone : ''} ${current ? v.nodeNow : ''}`}>
              {i > 0 && <span className={`${v.link} ${done || current ? v.linkOn : ''}`} />}
              <span className={v.dotB}>
                {done ? <Check size={16} strokeWidth={3} /> : r.isUltimate ? <CrownIcon size={22} /> : current ? r.day : <Lock size={13} />}
              </span>
              <span className={v.nodeLabel}>Day {r.day}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
