import React from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Zap, Shield, BarChart3, Globe, ArrowRight, Activity, Plane, MapPin, CheckCircle2, UserCheck, Calendar, Cpu, Database, Network, ChevronUp, Lock, Terminal, Box, Share2, Layers, ZapOff } from 'lucide-react';

const fontStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Familjen+Grotesk:wght@400;500;600;700;800;900&display=swap');
  .familjen { font-family: 'Familjen Grotesk', sans-serif; scroll-behavior: smooth; }
  .neo-brutal { 
    border: 3px solid #ffffff; 
    border-radius: 32px; 
    background: rgba(255, 255, 255, 0.04);
    box-shadow: 12px 12px 0px rgba(255, 255, 255, 0.05); 
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
  }
  .neo-brutal:hover {
    transform: translate(-6px, -6px);
    box-shadow: 18px 18px 0px rgba(250, 204, 21, 0.25);
    border-color: #facc15;
  }
  .text-gradient {
    background: linear-gradient(135deg, #facc15 0%, #eab308 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  @media (max-width: 768px) {
    .hide-mobile { display: none !important; }
    .nav-pill { width: 95% !important; padding: 12px 20px !important; }
    .hero-title { font-size: 48px !important; }
    .section-spacing { padding: 80px 24px !important; }
  }
`;

const SectionTitle = ({ subtitle, title, align = 'center', id }) => (
  <motion.div 
    id={id}
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    style={{ textAlign: align, marginBottom: 100, position: 'relative', zIndex: 10, scrollMarginTop: 140 }}
  >
    <div style={{ fontSize: 12, fontWeight: 900, color: '#facc15', letterSpacing: 5, marginBottom: 20 }}>{subtitle.toUpperCase()}</div>
    <h2 style={{ fontSize: 'clamp(40px, 7vw, 84px)', fontWeight: 950, letterSpacing: -5, lineHeight: 0.85, color: '#fff' }}>{title}</h2>
  </motion.div>
);

export default function LandingPage({ onGetStarted }) {
  const { scrollYProgress } = useScroll();
  const heroScale = useTransform(scrollYProgress, [0, 0.4], [1, 0.85]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.4], [0, -100]);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="familjen" style={{ 
      minHeight: '100vh', background: '#050505', color: '#ffffff',
      overflowX: 'hidden', position: 'relative'
    }}>
      <style>{fontStyles}</style>

      {/* FIXED BACKGROUND GRID */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)`,
        backgroundSize: '60px 60px', zIndex: 0, pointerEvents: 'none'
      }} />

      {/* NAVBAR */}
      <motion.nav 
        initial={{ y: -100, x: "-50%" }} animate={{ y: 0, x: "-50%" }}
        className="nav-pill"
        style={{ 
          position: 'fixed', top: 32, left: '50%', zIndex: 1000,
          width: '90%', maxWidth: 1100, padding: '16px 40px',
          background: 'rgba(5, 5, 5, 0.85)', backdropFilter: 'blur(30px)',
          border: '2px solid rgba(255,255,255,0.08)', borderRadius: 100,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.7)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }} onClick={() => window.scrollTo(0, 0)}>
          <Zap size={28} color="#facc15" fill="#facc15" />
          <span style={{ fontSize: 22, fontWeight: 950, letterSpacing: -1.5 }}>CHAINQUAKE</span>
        </div>
        <div style={{ display: 'flex', gap: 40, alignItems: 'center' }}>
          <div className="hide-mobile" style={{ display: 'flex', gap: 32 }}>
            {[
              { name: 'Blueprint', id: 'blueprint' },
              { name: 'Architecture', id: 'architecture' },
              { name: 'Metrics', id: 'metrics' }
            ].map(item => (
              <span 
                key={item.name} 
                onClick={() => scrollTo(item.id)}
                style={{ fontSize: 12, fontWeight: 800, color: '#94a3b8', cursor: 'pointer', letterSpacing: 2 }}
              >
                {item.name.toUpperCase()}
              </span>
            ))}
          </div>
          <motion.button 
            whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(250, 204, 21, 0.4)' }} whileTap={{ scale: 0.95 }}
            onClick={onGetStarted}
            style={{ 
              background: '#facc15', color: '#000', border: 'none', 
              borderRadius: 100, padding: '12px 32px', fontSize: 13, fontWeight: 900, cursor: 'pointer' 
            }}
          >ACCESS SYSTEM</motion.button>
        </div>
      </motion.nav>

      {/* HERO THEATER */}
      <motion.section 
        style={{ 
          height: '115vh', display: 'flex', alignItems: 'center', justifyContent: 'center', 
          position: 'relative', zIndex: 5, scale: heroScale, opacity: heroOpacity, y: heroY,
          paddingTop: 100
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: 1200, padding: '0 24px', position: 'relative', marginBottom: 100 }}>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.2, ease: "easeOut" }}
            style={{
              width: 'min(90vw, 950px)', height: 'min(80vh, 650px)',
              background: 'radial-gradient(circle at 50% 50%, #151515 0%, #050505 100%)',
              borderRadius: '240px 240px 60px 60px', border: '12px solid rgba(255,255,255,0.03)',
              position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 120px 240px rgba(0,0,0,1)'
            }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at 50% 50%, rgba(250, 204, 21, 0.14) 0%, transparent 70%)' }} />
            <div style={{ textAlign: 'center', zIndex: 10 }}>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}>
                <Zap size={110} color="#facc15" fill="#facc15" style={{ filter: 'drop-shadow(0 0 50px rgba(250, 204, 21, 0.6))' }} />
              </motion.div>
              <h1 className="hero-title" style={{ fontSize: 'clamp(56px, 11vw, 110px)', fontWeight: 950, letterSpacing: -8, lineHeight: 0.8, marginTop: 48, color: '#fff' }}>
                DETECT. PREDICT. <br/> <span className="text-gradient">STABILIZE.</span>
              </h1>
              <motion.button 
                whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }}
                onClick={onGetStarted}
                style={{ 
                  marginTop: 48, background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', 
                  borderRadius: 100, padding: '16px 40px', fontSize: 14, fontWeight: 900, cursor: 'pointer',
                  backdropFilter: 'blur(10px)'
                }}
              >
                INITIALIZE OPERATOR GATE <ArrowRight size={20} style={{ marginLeft: 12, verticalAlign: 'middle' }} />
              </motion.button>
            </div>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
            style={{ fontSize: 'clamp(18px, 2.5vw, 22px)', color: '#cbd5e1', fontWeight: 600, marginTop: 80, maxWidth: 950, margin: '80px auto 0', lineHeight: 1.4, letterSpacing: -0.5 }}
          >
            "Detect the tremors. Predict the impact. Stabilize the chain." <br/>
            <span style={{ color: '#64748b', fontSize: 16 }}>Autonomous Supply Chain Intelligence Platform | Submitted by Team Peaky Blinders</span>
          </motion.p>
        </div>
      </motion.section>

      {/* MISSION BLUEPRINT */}
      <section className="section-spacing" style={{ padding: '200px 24px', maxWidth: 1400, margin: '0 auto', position: 'relative', zIndex: 10 }}>
        <SectionTitle id="blueprint" subtitle="Mission Blueprint" title="Autonomous Intelligence." />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: 60 }}>
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} className="neo-brutal" style={{ padding: 60, background: 'rgba(255,255,255,0.02)' }}>
            <h3 style={{ fontSize: 32, fontWeight: 950, marginBottom: 32, color: '#facc15' }}>The Challenge</h3>
            <p style={{ fontSize: 18, color: '#cbd5e1', lineHeight: 1.7, fontWeight: 500 }}>
              Modern supply chains lack real-time visibility, failing to model dependency relationships effectively. This leads to delayed alerts and an inability to predict cascading impacts during global disruptions.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} className="neo-brutal" style={{ padding: 60, border: '3px solid #facc15' }}>
            <h3 style={{ fontSize: 32, fontWeight: 950, marginBottom: 32, color: '#fff' }}>The Solution</h3>
            <p style={{ fontSize: 18, color: '#cbd5e1', lineHeight: 1.7, fontWeight: 500 }}>
              ChainQuake integrates live news data for detection, graph-based modeling for tracking, and machine learning for proactive risk prediction. Reactive response &rarr; <span style={{ color: '#facc15' }}>Proactive Decision-Making.</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* ARCHITECTURAL STACK */}
      <section className="section-spacing" style={{ padding: '200px 24px', background: '#080808', borderTop: '2px solid rgba(255,255,255,0.06)', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <SectionTitle id="architecture" subtitle="Technical Ecosystem" title="The Command Stack." align="left" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32 }}>
            {[
              { title: 'Frontend', items: ['React', 'Framer Motion', 'Lucide-React'], icon: Globe, color: '#4277FB' },
              { title: 'Backend', items: ['FastAPI (Python)', 'NetworkX', 'Uvicorn'], icon: Terminal, color: '#facc15' },
              { title: 'Intelligence', items: ['Scikit-learn', 'GLM 5 API', 'NLP Engine'], icon: Cpu, color: '#10b981' },
              { title: 'Database', items: ['PostgreSQL', 'Cloud Native', 'Secure OAuth'], icon: Database, color: '#70449C' }
            ].map((v, i) => (
              <motion.div 
                key={i} whileHover={{ y: -12 }} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                className="neo-brutal" style={{ padding: 48, border: `3px solid ${v.color}`, height: 420, display: 'flex', flexDirection: 'column', background: 'rgba(5, 5, 5, 0.6)' }}
              >
                <div style={{ width: 64, height: 64, background: `${v.color}22`, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32, border: `1px solid ${v.color}44` }}>
                  <v.icon size={28} color={v.color} />
                </div>
                <h3 style={{ fontSize: 32, fontWeight: 950, marginBottom: 24 }}>{v.title}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {v.items.map(item => (
                    <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#94a3b8', fontSize: 16, fontWeight: 600 }}>
                      <CheckCircle2 size={16} color={v.color} />
                      {item}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* METRICS HUD */}
      <section className="section-spacing" style={{ padding: '220px 24px', background: '#0a0a0a', borderTop: '2px solid rgba(255,255,255,0.06)', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: 120, alignItems: 'center' }}>
          <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }}>
            <SectionTitle id="metrics" subtitle="Performance Metrics" title="System Reliability." align="left" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 60 }}>
              {[
                { label: 'Prediction', val: 'MAE < 0.2', desc: 'Accuracy in impact modeling.' },
                { label: 'Ingestion', val: '< 500ms', desc: 'News stream processing speed.' },
                { label: 'Security', val: 'OAuth 2.0', desc: 'Google-authenticated access.' },
                { label: 'Deployment', val: 'Render', desc: 'Cloud-native infrastructure.' }
              ].map((stat, i) => (
                <div key={i}>
                   <div style={{ fontSize: 44, fontWeight: 950, color: '#facc15', marginBottom: 12 }}>{stat.val}</div>
                   <div style={{ fontSize: 13, fontWeight: 900, color: '#fff', letterSpacing: 2.5, marginBottom: 8 }}>{stat.label.toUpperCase()}</div>
                   <div style={{ fontSize: 14, color: '#64748b', fontWeight: 600 }}>{stat.desc}</div>
                </div>
              ))}
            </div>
          </motion.div>
          <div className="neo-brutal" style={{ padding: 40, background: '#111', height: 600, position: 'relative', border: '3px solid rgba(255,255,255,0.1)' }}>
             <div style={{ height: '100%', border: '1px dashed rgba(255,255,255,0.12)', borderRadius: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 6, repeat: Infinity }}>
                   <Share2 size={160} color="#facc15" strokeWidth={1} />
                </motion.div>
                <div style={{ position: 'absolute', bottom: 48, left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
                   <div style={{ fontSize: 11, fontWeight: 950, color: '#facc15', letterSpacing: 6 }}>NEURAL_NODE_SYNCHRONIZATION</div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" style={{ padding: '240px 24px', textAlign: 'center', background: 'rgba(250, 204, 21, 0.04)', position: 'relative', zIndex: 10 }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(56px, 10vw, 120px)', fontWeight: 950, letterSpacing: -8, lineHeight: 0.8, marginBottom: 80 }}>
            Stabilize the <br/> <span className="text-gradient">Chain.</span>
          </h2>
          <motion.button 
            whileHover={{ scale: 1.05, boxShadow: '0 0 70px rgba(250, 204, 21, 0.6)' }} whileTap={{ scale: 0.95 }}
            onClick={onGetStarted}
            style={{ 
              background: '#facc15', color: '#000', border: 'none', borderRadius: 100, 
              padding: '32px 100px', fontSize: 22, fontWeight: 950, cursor: 'pointer',
              letterSpacing: 3, display: 'inline-flex', alignItems: 'center', gap: 24
            }}
          >
            INITIATE ACCESS <ArrowRight size={32} />
          </motion.button>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '160px 24px 100px', background: '#000', borderTop: '3px solid rgba(255,255,255,0.1)', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 120 }}>
          <div>
             <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 48, cursor: 'pointer' }} onClick={() => window.scrollTo(0, 0)}>
                <Zap size={44} color="#facc15" fill="#facc15" />
                <span style={{ fontSize: 28, fontWeight: 950, letterSpacing: -2 }}>CHAINQUAKE</span>
             </div>
             <p style={{ fontSize: 18, color: '#64748b', lineHeight: 1.7, fontWeight: 500, maxWidth: 450 }}>
               Autonomous intelligence platform submitted for TU x NIAT Hackathon. Quantifying fragility through neural node synchronization.
             </p>
             <div style={{ marginTop: 40, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                <span style={{ fontSize: 12, fontWeight: 800, color: '#10b981', letterSpacing: 2 }}>TEAM: PEAKY BLINDERS</span>
             </div>
          </div>
          {[
            { 
              title: 'Framework', 
              links: [
                { name: 'Blueprint', id: 'blueprint' },
                { name: 'Architecture', id: 'architecture' },
                { name: 'Metrics', id: 'metrics' }
              ] 
            },
            { 
              title: 'Intelligence', 
              links: [
                { name: 'AI Models', id: 'metrics' },
                { name: 'Risk Scoring', id: 'blueprint' },
                { name: 'Node Sync', id: 'metrics' }
              ] 
            },
            { 
              title: 'Protocol', 
              links: [
                { name: 'Auth Terminal', action: onGetStarted },
                { name: 'System Gate', id: 'cta' },
                { name: 'Operator Login', action: onGetStarted }
              ] 
            }
          ].map(col => (
            <div key={col.title}>
              <div style={{ fontSize: 12, fontWeight: 950, color: '#fff', letterSpacing: 4, marginBottom: 48 }}>{col.title.toUpperCase()}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {col.links.map(link => (
                  <span 
                    key={link.name} 
                    onClick={link.action ? link.action : () => scrollTo(link.id)}
                    style={{ fontSize: 18, color: '#64748b', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => e.target.style.color = '#facc15'}
                    onMouseLeave={(e) => e.target.style.color = '#64748b'}
                  >
                    {link.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 160, paddingTop: 40, borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
           <div style={{ fontSize: 14, color: '#475569', fontWeight: 800, letterSpacing: 2 }}>&copy; 2026 TEAM PEAKY BLINDERS | TU x NIAT | ALL MISSION DATA SECURED.</div>
        </div>
      </footer>
    </div>
  );
}
