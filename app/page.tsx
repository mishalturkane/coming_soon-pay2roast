'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';

const FIRE_PARTICLES = Array.from({ length: 20 }, (_, i) => i);
const BRAND_COLORS = ['#BAFF29', '#9381ff', '#00cba9', '#BAFF29', '#BAFF29', '#9381ff'];

function FireParticle({ index }: { index: number }) {
  const baseLeft = 4 + (index / 20) * 92;
  const size = 6 + (index % 5) * 3;
  const duration = 2 + (index % 5) * 0.45;
  const delay = (index % 8) * 0.35;
  const color = BRAND_COLORS[index % BRAND_COLORS.length];
  return (
    <motion.div
      className="absolute bottom-0 rounded-full pointer-events-none"
      style={{
        left: `${baseLeft}%`, width: size, height: size,
        background: `radial-gradient(circle, ${color}99 0%, ${color}44 50%, transparent 80%)`,
        filter: 'blur(1.5px)',
      }}
      animate={{
        y: [0, -(100 + (index % 7) * 22)],
        x: [0, ((index % 3) - 1) * 35],
        opacity: [0, 1, 0.5, 0],
        scale: [0.3, 1.3, 0.5, 0],
      }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeOut' }}
    />
  );
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <motion.div
        key={value}
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 'clamp(2rem, 5.5vw, 3.8rem)',
          lineHeight: 1,
          color: '#BAFF29',
          textShadow: '0 0 20px #BAFF2966',
        }}
      >
        {String(value).padStart(2, '0')}
      </motion.div>
      <span style={{
        color: '#ffffff45',
        fontSize: 'clamp(0.5rem, 1.1vw, 0.65rem)',
        letterSpacing: '0.2em',
        textTransform: 'uppercase' as const,
        marginTop: '2px',
        fontFamily: "'DM Mono', monospace",
      }}>
        {label}
      </span>
    </div>
  );
}

function Colon() {
  return (
    <motion.span
      animate={{ opacity: [1, 0.1, 1] }}
      transition={{ duration: 1, repeat: Infinity }}
      style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: 'clamp(2rem, 5.5vw, 3.8rem)',
        lineHeight: 1,
        color: '#BAFF29',
        alignSelf: 'flex-start',
        paddingTop: '2px',
      }}
    >
      :
    </motion.span>
  );
}

// March 16, 2026 at midnight IST (UTC+5:30) = March 15, 2026 18:30 UTC
function getLaunchDate() {
  return new Date('2026-03-15T18:30:00.000Z');
}

function getTimeUntil(target: Date) {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

const LAUNCH_DATE = getLaunchDate();

export default function ComingSoon() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'exists'>('idle');
  const [message, setMessage] = useState('');
  const [mounted, setMounted] = useState(false);
  const [countdown, setCountdown] = useState({ days: 15, hours: 0, minutes: 0, seconds: 0 });

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const rotateX = useTransform(mouseY, [0, 1], [3, -3]);
  const rotateY = useTransform(mouseX, [0, 1], [-3, 3]);

  useEffect(() => {
    setMounted(true);
    setCountdown(getTimeUntil(LAUNCH_DATE));
    const tick = setInterval(() => setCountdown(getTimeUntil(LAUNCH_DATE)), 1000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth);
      mouseY.set(e.clientY / window.innerHeight);
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, [mouseX, mouseY]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.status === 201) {
        setStatus('success');
        setMessage(data.message);
        setEmail('');
      } else if (data.alreadyExists) {
        setStatus('exists');
        setMessage(data.message);
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Try again.');
    }
    setTimeout(() => { setStatus('idle'); setMessage(''); }, 4000);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; overflow: hidden; background: #000; }
        input:-webkit-autofill, input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px #0a0a0a inset !important;
          -webkit-text-fill-color: #fff !important;
        }
        ::selection { background: #BAFF29; color: #000; }
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-inner { animation: marquee 16s linear infinite; }
        @keyframes flicker {
          0%, 94%, 100% { opacity: 1; }
          95%            { opacity: 0.65; }
          97%            { opacity: 1; }
          99%            { opacity: 0.75; }
        }
        .flicker { animation: flicker 7s ease-in-out infinite; }
      `}</style>

      <div style={{
        fontFamily: "'DM Sans', sans-serif",
        position: 'relative', width: '100vw', height: '100vh',
        overflow: 'hidden', background: '#000',
      }}>

        {/* Dot grid */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(circle, #BAFF2918 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }} />

        {/* Green glow top-left */}
        <div style={{
          position: 'absolute', top: '-10%', left: '-5%',
          width: '45%', height: '55%', borderRadius: '50%',
          background: 'radial-gradient(circle, #BAFF2912 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Purple glow bottom-right */}
        <div style={{
          position: 'absolute', bottom: '-10%', right: '-5%',
          width: '50%', height: '55%', borderRadius: '50%',
          background: 'radial-gradient(circle, #9381ff10 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Marquee ticker */}
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%',
          borderBottom: '1px solid #BAFF2930', background: '#BAFF2908',
          overflow: 'hidden', height: 'clamp(22px, 3vh, 30px)',
          display: 'flex', alignItems: 'center', zIndex: 20,
        }}>
          <div className="marquee-inner" style={{
            display: 'flex', gap: '3rem', whiteSpace: 'nowrap',
            fontFamily: "'DM Mono', monospace", fontSize: '0.6rem',
            color: '#BAFF2999', letterSpacing: '0.15em',
          }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i}>🔥 PAY2ROAST IS COMING &nbsp;·&nbsp; BUILT ON SOLANA &nbsp;·&nbsp; WHO U ROASTING? &nbsp;·&nbsp;</span>
            ))}
          </div>
        </div>

        {/* Fire particles */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '180px', overflow: 'hidden', pointerEvents: 'none' }}>
          {mounted && FIRE_PARTICLES.map((i) => <FireParticle key={i} index={i} />)}
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '1px', background: 'linear-gradient(90deg, transparent, #BAFF2944, #9381ff44, #BAFF2944, transparent)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '70px', background: 'linear-gradient(to top, #BAFF2908, transparent)' }} />
        </div>

        {/* Corner brackets */}
        {([
          { top: 'clamp(28px,4vh,40px)', left: '12px', borderTop: '2px solid #BAFF29', borderLeft: '2px solid #BAFF29' },
          { top: 'clamp(28px,4vh,40px)', right: '12px', borderTop: '2px solid #BAFF29', borderRight: '2px solid #BAFF29' },
          { bottom: '12px', left: '12px', borderBottom: '2px solid #9381ff', borderLeft: '2px solid #9381ff' },
          { bottom: '12px', right: '12px', borderBottom: '2px solid #9381ff', borderRight: '2px solid #9381ff' },
        ] as React.CSSProperties[]).map((s, i) => (
          <div key={i} style={{ position: 'absolute', width: 18, height: 18, pointerEvents: 'none', ...s }} />
        ))}

        {/* CENTER CONTENT */}
        <motion.div
          style={{
            position: 'relative', zIndex: 10,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            width: '100%', height: '100%', padding: '0 1.25rem',
            rotateX, rotateY, transformPerspective: 1000,
          }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            style={{ marginBottom: 'clamp(0.6rem, 1.8vh, 1rem)' }}
          >
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              border: '1px solid #BAFF2950', background: '#BAFF2910',
              color: '#BAFF29', borderRadius: '4px', padding: '3px 10px',
              fontFamily: "'DM Mono', monospace",
              fontSize: 'clamp(0.58rem, 1.1vw, 0.65rem)',
              letterSpacing: '0.18em', textTransform: 'uppercase',
            }}>
              <motion.span
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                style={{ width: 6, height: 6, borderRadius: '50%', background: '#BAFF29', display: 'inline-block' }}
              />
              Launching Soon
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            className="flicker"
            initial={{ opacity: 0, y: 30, skewX: -2 }}
            animate={{ opacity: 1, y: 0, skewX: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 'clamp(3.4rem, 14vw, 9.5rem)',
              lineHeight: 0.9, letterSpacing: '0.03em',
              textAlign: 'center', color: '#fff',
              textShadow: '0 0 50px #BAFF2922',
              marginBottom: 'clamp(0.3rem, 1vh, 0.6rem)',
            }}
          >
            PAY2<span style={{ color: '#BAFF29', textShadow: '0 0 40px #BAFF2966, 0 0 80px #BAFF2922' }}>ROAST</span>
          </motion.h1>

          {/* X Follow Button */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.22 }}
            style={{ marginBottom: 'clamp(0.5rem, 1.5vh, 0.9rem)' }}
          >
            <a
              href="https://x.com/pay2roastdotfun"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                background: '#BAFF2915', border: '1px solid #BAFF2940',
                color: '#BAFF29', borderRadius: '4px',
                padding: '4px 12px', textDecoration: 'none',
                fontFamily: "'DM Mono', monospace",
                fontSize: 'clamp(0.58rem, 1.1vw, 0.65rem)',
                letterSpacing: '0.12em', textTransform: 'uppercase',
                transition: 'background 0.2s, border-color 0.2s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.background = '#BAFF2925';
                (e.currentTarget as HTMLAnchorElement).style.borderColor = '#BAFF2970';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.background = '#BAFF2915';
                (e.currentTarget as HTMLAnchorElement).style.borderColor = '#BAFF2940';
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Follow @pay2roastdotfun
            </a>
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.3 }}
            style={{
              textAlign: 'center',
              fontSize: 'clamp(0.72rem, 1.7vw, 0.92rem)',
              color: '#ffffff70', maxWidth: '36ch',
              lineHeight: 1.7, letterSpacing: '0.01em',
              marginBottom: 'clamp(0.8rem, 2.5vh, 1.8rem)',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            pay to roast who you want, get roasted by who you want,{' '}
            <span style={{ color: '#00cba9', fontWeight: 600 }}>you cooked for eating SOL.</span>
          </motion.p>

          {/* Countdown */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.42 }}
            style={{
              display: 'flex', alignItems: 'center',
              gap: 'clamp(0.5rem, 2vw, 1.1rem)',
              marginBottom: 'clamp(0.9rem, 3vh, 2rem)',
              padding: 'clamp(0.5rem, 1.2vh, 0.8rem) clamp(0.8rem, 2vw, 1.5rem)',
              border: '1px solid #BAFF2925', borderRadius: '8px',
              background: '#BAFF2906',
              boxShadow: '0 0 30px #BAFF2908 inset',
            }}
          >
            <CountdownUnit value={countdown.days} label="Days" />
            <Colon />
            <CountdownUnit value={countdown.hours} label="Hrs" />
            <Colon />
            <CountdownUnit value={countdown.minutes} label="Min" />
            <Colon />
            <CountdownUnit value={countdown.seconds} label="Sec" />
          </motion.div>

          {/* Email form */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.54 }}
            style={{ width: '100%', maxWidth: 'min(430px, 88vw)' }}
          >
            <form
              onSubmit={handleSubmit}
              style={{
                display: 'flex', flexDirection: 'row',
                border: '1.5px solid #BAFF2935', borderRadius: '8px',
                overflow: 'hidden', boxShadow: '0 0 24px #BAFF2910',
              }}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Get notified via Gmail"
                disabled={status === 'loading' || status === 'success'}
                style={{
                  flex: 1, background: '#0a0a0a', color: '#fff',
                  border: 'none', outline: 'none',
                  padding: 'clamp(0.6rem, 1.4vh, 0.8rem) clamp(0.75rem, 2vw, 1rem)',
                  fontSize: 'clamp(0.75rem, 1.6vw, 0.85rem)',
                  fontFamily: "'DM Sans', sans-serif", minWidth: 0,
                }}
              />
              <motion.button
                type="submit"
                disabled={status === 'loading' || status === 'success'}
                whileHover={{ filter: 'brightness(1.08)' }}
                whileTap={{ scale: 0.96 }}
                style={{
                  background: status === 'success' ? '#0d3d1a' : '#BAFF29',
                  color: '#000', border: 'none', outline: 'none',
                  cursor: 'pointer',
                  padding: 'clamp(0.6rem, 1.4vh, 0.8rem) clamp(0.9rem, 2.5vw, 1.4rem)',
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 'clamp(0.78rem, 1.5vw, 0.9rem)',
                  letterSpacing: '0.12em', fontWeight: 700,
                  whiteSpace: 'nowrap', flexShrink: 0,
                  transition: 'background 0.2s',
                }}
              >
                {status === 'loading' ? (
                  <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 0.7, repeat: Infinity }}>···</motion.span>
                ) : status === 'success' ? '🔥 LOCKED IN' : 'NOTIFY ME'}
              </motion.button>
            </form>

            <AnimatePresence mode="wait">
              {message && (
                <motion.p
                  key={message}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    textAlign: 'center', marginTop: '0.5rem',
                    fontSize: '0.72rem', fontFamily: "'DM Mono', monospace",
                    color: status === 'success' ? '#BAFF29' : status === 'exists' ? '#00cba9' : '#ff4d4d',
                  }}
                >
                  {message}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            style={{
              display: 'flex', gap: 'clamp(0.4rem, 1.5vw, 0.7rem)',
              marginTop: 'clamp(0.8rem, 2.5vh, 1.5rem)',
              flexWrap: 'wrap', justifyContent: 'center',
            }}
          >
            {[
              { label: '💸 Pay in SOL', color: '#BAFF29' },
              { label: '🔥 Roast on-chain', color: '#9381ff' },
              { label: '🧑‍🍳 Get cooked', color: '#00cba9' },
            ].map(({ label, color }) => (
              <span key={label} style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 'clamp(0.6rem, 1.2vw, 0.68rem)',
                color, border: `1px solid ${color}35`,
                background: `${color}0a`, borderRadius: '4px',
                padding: '3px 9px', letterSpacing: '0.08em',
              }}>
                {label}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          style={{
            position: 'absolute', bottom: '0.9rem',
            left: 0, width: '100%', textAlign: 'center',
            fontFamily: "'DM Mono', monospace",
            fontSize: '10px', color: '#ffffff18',
            letterSpacing: '0.2em', pointerEvents: 'none',
          }}
        >
          BUILT ON SOLANA · ROAST RESPONSIBLY
        </motion.p>
      </div>
    </>
  );
}