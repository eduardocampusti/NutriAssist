import React from 'react';
import { LetterheadConfig } from '../types';
import { APP_VERSION, RELEASE_DATE, RELEASE_NOTES } from '../constants';
import {
  ShieldCheck, Cpu, Database, FileCheck, Users, Award,
  Code2, HeartPulse, ChefHat, GraduationCap, Building2,
  X, LayoutGrid, ClipboardList, ExternalLink, MapPin, Calendar
} from 'lucide-react';

interface AboutSystemProps {
  config: LetterheadConfig;
  onClose: () => void;
}

/* ─── Paletas dos módulos ─── */
const MODULE_COLORS: Record<string, { bg: string; color: string }> = {
  emerald: { bg: '#f0fdf4', color: '#15803d' },
  blue:    { bg: '#eff6ff', color: '#1d4ed8' },
  orange:  { bg: '#fff7ed', color: '#c2410c' },
  rose:    { bg: '#fff1f2', color: '#be123c' },
  purple:  { bg: '#faf5ff', color: '#7e22ce' },
  slate:   { bg: '#f8fafc', color: '#475569' },
};

const ModuleCard = ({ icon: Icon, label, color }: { icon: any; label: string; color: string }) => {
  const pal = MODULE_COLORS[color] || MODULE_COLORS.slate;
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 16,
        border: '1px solid rgba(0,0,0,0.07)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)',
        padding: '16px 12px',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 10, cursor: 'pointer',
        transition: 'all 0.2s ease',
        minHeight: 100,
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = 'translateY(-3px)';
        el.style.boxShadow = '0 4px 8px rgba(0,0,0,0.06), 0 12px 28px rgba(0,0,0,0.10)';
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = 'translateY(0)';
        el.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)';
      }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 11,
        background: pal.bg, color: pal.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `1px solid ${pal.bg}`,
        boxShadow: '0 2px 6px rgba(0,0,0,0.07)',
      }}>
        <Icon style={{ width: 19, height: 19 }} />
      </div>
      <span style={{
        fontSize: 10, fontWeight: 700, color: '#64748b',
        textTransform: 'uppercase', letterSpacing: '0.04em',
        textAlign: 'center', lineHeight: 1.3,
      }}>{label}</span>
    </div>
  );
};

const AboutSystem: React.FC<AboutSystemProps> = ({ config, onClose }) => {
  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', padding: '24px 32px 64px', fontFamily: 'inherit' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 4 }}>
              Informações Institucionais
            </p>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em', margin: 0 }}>
              Sobre o <span style={{ color: '#059669' }}>Sistema</span>
            </h1>
          </div>
          <button onClick={onClose} style={{
            width: 36, height: 36, borderRadius: 10,
            background: '#fff', border: '1px solid #e2e8f0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#64748b',
            boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
            transition: 'all 0.15s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#e11d48'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#64748b'; }}
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* HERO BANNER */}
        <div style={{
          position: 'relative', borderRadius: 22, overflow: 'hidden',
          marginBottom: 24, minHeight: 260,
          background: "url('/premium-hero.png') center/cover no-repeat",
          boxShadow: '0 4px 12px rgba(0,0,0,0.08), 0 20px 48px rgba(0,0,0,0.14)',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(95deg, rgba(6,78,59,0.96) 0%, rgba(6,78,59,0.45) 100%)',
          }} />
          <div style={{ position: 'relative', zIndex: 1, padding: '36px 44px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(4px)',
                border: '1px solid rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
              }}>🥗</div>
              <span style={{
                padding: '4px 12px', borderRadius: 20,
                background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)',
                color: '#6ee7b7', fontSize: 10, fontWeight: 700,
                letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>Versão {APP_VERSION}</span>
            </div>
            <h2 style={{
              fontSize: 36, fontWeight: 900, color: '#fff',
              letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 12px',
            }}>
              NUTRIASSIST <span style={{ color: '#34d399' }}>SME</span> —<br />GESTÃO INTELIGENTE
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.82)', lineHeight: 1.6, maxWidth: 520, margin: '0 0 20px' }}>
              A solução definitiva para automação técnica nutricional, garantindo conformidade com o PNAE e eficiência operacional para a rede municipal de ensino.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {[
                { icon: ShieldCheck, label: 'Segurança PNAE' },
                { icon: Cpu, label: 'Automação IA' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '7px 14px', borderRadius: 9,
                  background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
                  color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
                  backdropFilter: 'blur(4px)',
                }}>
                  <Icon style={{ width: 14, height: 14, color: '#34d399' }} />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CARDS DE EQUIPE — compactos e premium */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>

          {/* Nutricionista */}
          <div style={{
            background: '#fff', borderRadius: 18,
            border: '1px solid rgba(0,0,0,0.07)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.05), 0 10px 28px rgba(0,0,0,0.08)',
            overflow: 'hidden', transition: 'all 0.2s ease',
          }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(-3px)'; el.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08), 0 20px 48px rgba(0,0,0,0.12)'; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(0)'; el.style.boxShadow = '0 2px 6px rgba(0,0,0,0.05), 0 10px 28px rgba(0,0,0,0.08)'; }}
          >
            {/* Topo colorido */}
            <div style={{ background: 'linear-gradient(135deg, #fff1f2 0%, #fecdd3 100%)', padding: '20px 22px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.10)' }}>
                <ChefHat style={{ width: 22, height: 22, color: '#be123c' }} />
              </div>
              <span style={{ fontSize: 9, fontWeight: 800, padding: '3px 10px', borderRadius: 20, background: 'rgba(190,18,60,0.1)', color: '#be123c', border: '1px solid rgba(190,18,60,0.2)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>RT Ativa</span>
            </div>
            {/* Corpo */}
            <div style={{ padding: '16px 22px 20px' }}>
              <p style={{ fontSize: 9.5, fontWeight: 700, color: '#be123c', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Responsabilidade Técnica</p>
              <h3 style={{ fontSize: 17, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', margin: '0 0 4px' }}>
                {config.nutricionistaNome || 'Alexandra Fernandes'}
              </h3>
              <p style={{ fontSize: 12, color: '#64748b', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Award style={{ width: 12, height: 12, color: '#10b981' }} /> CRN-5/16419
              </p>
              <p style={{ fontSize: 12, color: '#64748b', fontStyle: 'italic', lineHeight: 1.5, paddingTop: 12, borderTop: '1px solid #f1f5f9', margin: 0 }}>
                "Supervisão rigorosa dos parâmetros nutricionais e conformidade com o PNAE."
              </p>
            </div>
          </div>

          {/* Dev */}
          <div style={{
            background: '#fff', borderRadius: 18,
            border: '1px solid rgba(0,0,0,0.07)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.05), 0 10px 28px rgba(0,0,0,0.08)',
            overflow: 'hidden', transition: 'all 0.2s ease',
          }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(-3px)'; el.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08), 0 20px 48px rgba(0,0,0,0.12)'; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(0)'; el.style.boxShadow = '0 2px 6px rgba(0,0,0,0.05), 0 10px 28px rgba(0,0,0,0.08)'; }}
          >
            <div style={{ background: 'linear-gradient(135deg, #fffbeb 0%, #fde68a 100%)', padding: '20px 22px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.10)' }}>
                <Code2 style={{ width: 22, height: 22, color: '#b45309' }} />
              </div>
              <span style={{ fontSize: 9, fontWeight: 800, padding: '3px 10px', borderRadius: 20, background: 'rgba(180,83,9,0.1)', color: '#b45309', border: '1px solid rgba(180,83,9,0.2)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Lead Dev</span>
            </div>
            <div style={{ padding: '16px 22px 20px' }}>
              <p style={{ fontSize: 9.5, fontWeight: 700, color: '#b45309', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Engenharia de Software</p>
              <h3 style={{ fontSize: 17, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', margin: '0 0 4px' }}>Carlos Eduardo</h3>
              <p style={{ fontSize: 12, color: '#64748b', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Cpu style={{ width: 12, height: 12, color: '#10b981' }} /> Full Stack Developer
              </p>
              <p style={{ fontSize: 12, color: '#64748b', fontStyle: 'italic', lineHeight: 1.5, paddingTop: 12, borderTop: '1px solid #f1f5f9', margin: 0 }}>
                "Ecossistema digital focado em segurança, alta performance e usabilidade governamental."
              </p>
            </div>
          </div>
        </div>

        {/* LINHA: ADMINISTRAÇÃO + MÓDULOS */}
        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 16, marginBottom: 24 }}>

          {/* Painel Administração */}
          <div style={{
            background: '#fff', borderRadius: 18, padding: '22px 24px',
            border: '1px solid rgba(0,0,0,0.07)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.05), 0 10px 28px rgba(0,0,0,0.08)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 16, borderBottom: '1px solid #f1f5f9', marginBottom: 18 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 style={{ width: 17, height: 17, color: '#34d399' }} />
              </div>
              <div>
                <p style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.12em', textTransform: 'uppercase', margin: 0 }}>Gestão 2025–2028</p>
                <p style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.01em' }}>Administração Municipal</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: 'Prefeito Municipal', value: config.prefeitoNome || 'Dr. Antônio Kleber Ribeiro' },
                { label: 'Secretária de Educação', value: config.secretariaNome || 'Gislene Leite Santos Araújo' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p style={{ fontSize: 9.5, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                    {label}
                  </p>
                  <p style={{ fontSize: 15, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>{value}</p>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
              <MapPin style={{ width: 12, height: 12, color: '#10b981', flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: '#64748b' }}>{config.municipio || 'Brotas de Macaúbas'} — BA</span>
              <span style={{ marginLeft: 'auto', fontSize: 9.5, fontWeight: 700, color: '#10b981', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Transparência Ativa
              </span>
            </div>
          </div>

          {/* Módulos */}
          <div style={{
            background: '#fff', borderRadius: 18, padding: '22px 24px',
            border: '1px solid rgba(0,0,0,0.07)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.05), 0 10px 28px rgba(0,0,0,0.08)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LayoutGrid style={{ width: 17, height: 17, color: '#15803d' }} />
              </div>
              <div>
                <p style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.12em', textTransform: 'uppercase', margin: 0 }}>Ecossistema Digital</p>
                <p style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.01em' }}>Módulos Instalados</p>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              <ModuleCard icon={ShieldCheck} label="Compliance PNAE" color="emerald" />
              <ModuleCard icon={Database} label="Banco de Dados" color="blue" />
              <ModuleCard icon={Users} label="Gestão RBAC" color="orange" />
              <ModuleCard icon={FileCheck} label="Auditoria Digital" color="slate" />
              <ModuleCard icon={Cpu} label="Automação IA" color="purple" />
              <ModuleCard icon={Award} label="Certificação" color="blue" />
              <ModuleCard icon={GraduationCap} label="Capacitação" color="orange" />
              <ModuleCard icon={HeartPulse} label="Saúde Escolar" color="rose" />
            </div>
          </div>
        </div>

        {/* HISTÓRICO DE RELEASES */}
        <div style={{
          background: '#fff', borderRadius: 18, padding: '22px 24px',
          border: '1px solid rgba(0,0,0,0.07)',
          boxShadow: '0 2px 6px rgba(0,0,0,0.05), 0 10px 28px rgba(0,0,0,0.08)',
          marginBottom: 24,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ClipboardList style={{ width: 17, height: 17, color: '#15803d' }} />
            </div>
            <div>
              <p style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.12em', textTransform: 'uppercase', margin: 0 }}>Registro de Mudanças</p>
              <p style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.01em' }}>Histórico de Releases</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {RELEASE_NOTES.map((release, idx) => (
              <div key={release.version} style={{
                paddingLeft: 24, paddingBottom: 20,
                borderLeft: '2px solid #e2e8f0',
                position: 'relative',
                marginLeft: 8,
              }}>
                <div style={{
                  position: 'absolute', left: -9, top: 2,
                  width: 16, height: 16, borderRadius: '50%',
                  background: '#fff', border: '2px solid #10b981',
                  boxShadow: '0 0 0 3px rgba(16,185,129,0.12)',
                }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#059669', letterSpacing: '-0.01em' }}>v{release.version}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Calendar style={{ width: 11, height: 11 }} /> {release.date}
                  </span>
                </div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>{release.description}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {release.changes.map((change: string, cIdx: number) => (
                    <div key={cIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, fontSize: 12, color: '#64748b' }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#34d399', flexShrink: 0, marginTop: 5 }} />
                      {change}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <div style={{ textAlign: 'center', paddingTop: 16, borderTop: '1px solid #e2e8f0' }}>
          <p style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', margin: '0 0 4px' }}>
            Desenvolvido exclusivamente para a Secretaria Municipal de Educação
          </p>
          <p style={{ fontSize: 10, color: '#94a3b8', margin: 0 }}>
            {config.municipio || 'Brotas de Macaúbas'} — BA • {new Date().getFullYear()}
          </p>
        </div>

      </div>
    </div>
  );
};

export default AboutSystem;
