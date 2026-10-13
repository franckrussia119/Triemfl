import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion, animate } from "motion/react";

// Motion building blocks for the public site. Every effect switches off for
// visitors who ask their device to reduce motion.

const ease = [0.22, 1, 0.36, 1] as const;

/** Cycles through phrases with a vertical slide. */
export function RotatingWords({ words, interval = 2800, className = "" }: { words: string[]; interval?: number; className?: string }) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (reduce || paused || words.length < 2) return;
    const t = setInterval(() => setI((x) => (x + 1) % words.length), interval);
    return () => clearInterval(t);
  }, [reduce, paused, words.length, interval]);
  const word = words[i % words.length] || "";
  return (
    <span className={`relative inline-flex overflow-hidden align-bottom ${className}`} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {/* Screen readers get the full list once, not a changing word */}
      <span className="sr-only">{words.join(", ")}</span>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={word}
          aria-hidden
          className="block whitespace-nowrap"
          initial={reduce ? false : { y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={reduce ? undefined : { y: "-100%", opacity: 0 }}
          transition={{ duration: 0.65, ease }}
        >
          {word}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** Fades and lifts content into view once, as the visitor scrolls. */
export function Reveal({ children, delay = 0, className = "", as = "div" }: { children: React.ReactNode; delay?: number; className?: string; as?: "div" | "li" | "section" }) {
  const reduce = useReducedMotion();
  const Tag = motion[as] as typeof motion.div;
  if (reduce) return React.createElement(as, { className }, children);
  return (
    <Tag className={className} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.75, delay, ease }}>
      {children}
    </Tag>
  );
}

/** Staggered entrance for the hero, on page load. */
export function Enter({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return <motion.div className={className} initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay, ease }}>{children}</motion.div>;
}

/** Number that counts up when it scrolls into view. */
export function CountUp({ value, className = "" }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  useEffect(() => {
    if (!ref.current) return;
    if (reduce || !inView) { ref.current.textContent = (reduce ? value : 0).toLocaleString("en"); return; }
    const c = animate(0, value, { duration: 1.6, ease, onUpdate: (v) => { if (ref.current) ref.current.textContent = Math.round(v).toLocaleString("en"); } });
    return () => c.stop();
  }, [inView, value, reduce]);
  return <span ref={ref} className={className}>0</span>;
}

/** Continuously scrolling ticker. Pauses on hover and keyboard focus. */
export function Ticker({ items, label }: { items: { tag: string; text: string; href?: string }[]; label: string }) {
  const reduce = useReducedMotion();
  if (!items.length) return null;
  const row = (dup: boolean) => (
    <ul className="flex shrink-0 items-center gap-10 pr-10" aria-hidden={dup || undefined}>
      {items.map((it, i) => (
        <li key={i} className="flex items-center gap-3 whitespace-nowrap text-[0.95rem]">
          <span className="text-[0.72rem] font-bold tracking-wide text-navy-deep bg-gold rounded px-1.5 py-0.5">{it.tag}</span>
          {it.href ? <a href={it.href} tabIndex={dup ? -1 : undefined} className="text-slate-200 hover:text-white">{it.text}</a> : <span className="text-slate-200">{it.text}</span>}
          <span className="text-slate-600" aria-hidden>◆</span>
        </li>
      ))}
    </ul>
  );
  if (reduce) {
    return <div className="overflow-x-auto" aria-label={label}>{row(false)}</div>;
  }
  const seconds = Math.max(30, items.length * 7);
  return (
    <div className="ticker group relative overflow-hidden" aria-label={label} style={{ maskImage: "linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)" }}>
      <div className="ticker-track flex w-max" style={{ animationDuration: `${seconds}s` }}>
        {row(false)}{row(true)}
      </div>
    </div>
  );
}

/** Small pulsing status dot. */
export function LiveDot({ className = "bg-emerald-400" }: { className?: string }) {
  return (
    <span className="relative inline-flex w-2.5 h-2.5" aria-hidden>
      <span className={`live-ping absolute inset-0 rounded-full ${className}`} />
      <span className={`relative inline-flex w-2.5 h-2.5 rounded-full ${className}`} />
    </span>
  );
}

export { AnimatePresence, motion, useReducedMotion };
