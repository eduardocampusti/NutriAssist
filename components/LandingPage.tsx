
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { usePNAE } from '../contexts/PNAEContext';

interface LandingPageProps {
  onEnterSystem: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnterSystem }) => {
  const { letterhead } = usePNAE();
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "NutriAssist",
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "BRL"
    },
    "description": "Sistema de Gestão Técnica de Nutrição Escolar - NutriAssist. Controle de estoque, cardápios, avaliação nutricional e PNAE.",
    "publisher": {
      "@type": "Organization",
      "name": letterhead.secretaria || "Secretaria Municipal de Educação"
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden font-sans">
      <Helmet>
        <title>NutriAssist | Gestão Inteligente para Nutrição Escolar</title>
        <meta name="description" content="Automatize a gestão da nutrição escolar com o NutriAssist. Cardápios PNAE, controle de estoque e relatórios nutricionais em uma única plataforma gov." />
        <link rel="canonical" href="https://nutriassist.gov.br/" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://nutriassist.gov.br/" />
        <meta property="og:title" content="NutriAssist | Gestão Inteligente para Nutrição Escolar" />
        <meta property="og:description" content="Automatize a gestão da nutrição escolar com o NutriAssist. Cardápios PNAE, controle de estoque e relatórios nutricionais." />
        <meta property="og:image" content="https://nutriassist.gov.br/login-bg.jpg" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://nutriassist.gov.br/" />
        <meta property="twitter:title" content="NutriAssist | Gestão Inteligente para Nutrição Escolar" />
        <meta property="twitter:description" content="Automatize a gestão da nutrição escolar com o NutriAssist. Cardápios PNAE, controle de estoque e relatórios nutricionais." />
        <meta property="twitter:image" content="https://nutriassist.gov.br/login-bg.jpg" />

        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "O NutriAssist é gratuito?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Sim, o NutriAssist oferece uma versão gratuita para demonstração e pequenas redes municipais, com foco na conformidade ao PNAE."
                }
              },
              {
                "@type": "Question",
                "name": "O sistema segue as normas do FNDE?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Sim, todo o motor de cálculo e gerador de documentos foi treinado especificamente nas resoluções vigentes do FNDE e normas do PNAE."
                }
              }
            ]
          })}
        </script>
      </Helmet>
      {/* HEADER */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🥗</span>
            <span className="text-xl font-black tracking-tighter text-slate-900">NutriAssist<span className="text-emerald-600">.</span></span>
          </div>

          <nav className="hidden md:flex items-center gap-10">
            <a href="#funcionalidades" className="text-sm font-bold text-slate-500 hover:text-emerald-600 transition-colors">Funcionalidades</a>
            <a href="#preview" className="text-sm font-bold text-slate-500 hover:text-emerald-600 transition-colors">Sistema</a>
            <a href="#depoimentos" className="text-sm font-bold text-slate-500 hover:text-emerald-600 transition-colors">Depoimentos</a>
            <a href="#contato" className="text-sm font-bold text-slate-500 hover:text-emerald-600 transition-colors">Contato</a>
          </nav>

          <button
            onClick={onEnterSystem}
            className="bg-slate-900 text-white px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest hover:bg-emerald-600 hover:scale-105 transition-all shadow-xl shadow-slate-200 active:scale-95"
          >
            Comece Agora
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="pt-40 pb-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 animate-in slide-in-from-left duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">{letterhead.secretaria || 'SME'} {letterhead.municipio || 'Brotas de Macaúbas/BA'} em Nutrição Escolar</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.05] tracking-tighter">
              Gestão Nutricional <br />
              <span className="text-emerald-600">Inteligente</span> e Ágil.
            </h1>
            <p className="text-lg text-slate-500 max-w-lg leading-relaxed font-medium">
              Transforme a alimentação escolar com automação de cardápios, controle de estoque e conformidade total ao PNAE em uma única plataforma elegante.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={onEnterSystem}
                className="bg-emerald-600 text-white px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-200 active:scale-95"
              >
                Testar Gratuitamente
              </button>
              <a href="#preview" className="px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all flex items-center gap-2">
                Ver Demonstração <span>↓</span>
              </a>
            </div>
          </div>

          <div className="relative animate-in zoom-in duration-1000">
            <div className="absolute -inset-4 bg-emerald-100/50 rounded-[40px] blur-3xl"></div>
            <img
              src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1200&auto=format&fit=crop"
              alt="Alimentação Saudável"
              className="relative rounded-[40px] shadow-2xl border-8 border-white object-cover aspect-[4/3] w-full"
            />
            <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-3xl shadow-2xl border border-slate-100 hidden md:block">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-2xl">🥦</div>
                <div>
                  <p className="text-xs font-black text-slate-900 uppercase tracking-tighter">Saúde Garantida</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Monitoramento 100% PNAE</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="funcionalidades" className="py-24 bg-slate-50/50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <h2 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em]">Recursos do Sistema</h2>
            <h3 className="text-4xl font-black text-slate-900 tracking-tight">Tudo o que sua rede precisa <br /> em um só lugar.</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { icon: '🤖', title: 'Automação de Cardápios', desc: 'Gere cardápios equilibrados por faixa etária em segundos usando nossa IA treinada nas normas do FNDE.' },
              { icon: '📦', title: 'Controle de Almoxarifado', desc: 'Monitore entradas, saídas e validades. Receba alertas de estoque baixo antes que falte o alimento.' },
              { icon: '📊', title: 'Relatórios Gerenciais', desc: 'Dashboards completos com indicadores de consumo, desperdício e impacto nutricional da rede.' },
              { icon: '📜', title: 'Atos Administrativos', desc: 'Redação oficial instantânea para pareceres, notas técnicas e ofícios seguindo padrões institucionais.' },
              { icon: '⚖️', title: 'Vigilância SISVAN', desc: 'Registro antropométrico e diagnósticos nutricionais padronizados para monitoramento da saúde escolar.' },
              { icon: '🧩', title: 'Inclusão Alimentar', desc: 'Cardápios adaptados para seletividade (TEA), alergias e intolerâncias de forma automática.' }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5 transition-all group">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 group-hover:bg-emerald-50 transition-all">
                  {feature.icon}
                </div>
                <h4 className="text-lg font-black text-slate-900 mb-3 uppercase tracking-tighter">{feature.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SYSTEM PREVIEW SECTION */}
      <section id="preview" className="py-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="bg-slate-900 rounded-[60px] p-8 lg:p-20 relative overflow-hidden">
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8 text-white">
                <h2 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">Interface Intuitiva</h2>
                <h3 className="text-4xl lg:text-5xl font-black leading-tight tracking-tighter">O painel que fala <br /> a sua língua.</h3>
                <p className="text-slate-400 leading-relaxed font-medium">
                  Esqueça planilhas complexas. Nossa interface foi desenhada para nutricionistas que buscam agilidade sem abrir mão da precisão técnica. Tudo a um clique de distância.
                </p>
                <ul className="space-y-4">
                  {['Layout responsivo (PC e Mobile)', 'Acesso rápido a documentos recentes', 'Notificações de pendências técnicas'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm font-bold">
                      <span className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-[10px]">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative group">
                <div className="absolute -inset-10 bg-emerald-500/20 blur-[100px] rounded-full group-hover:bg-emerald-500/30 transition-all"></div>
                {/* Fake UI Preview */}
                <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-800/50 overflow-hidden transform rotate-2 group-hover:rotate-0 transition-transform duration-500">
                  <div className="bg-slate-100 px-4 py-3 flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                      <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                    </div>
                    <div className="flex-1 bg-white h-5 rounded-md border border-slate-200"></div>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                      {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-50 rounded-xl border border-slate-100"></div>)}
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                      <div className="h-2 bg-slate-50 rounded w-full"></div>
                      <div className="h-2 bg-slate-50 rounded w-full"></div>
                    </div>
                    <div className="h-40 bg-emerald-50/30 rounded-2xl border border-dashed border-emerald-200 flex items-center justify-center text-emerald-200 font-black text-2xl">DASHBOARD</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section id="depoimentos" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em]">Experiências Reais</h2>
            <h3 className="text-4xl font-black text-slate-900 tracking-tight">O que dizem os especialistas.</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Dra. Alexandra Fernandes', role: 'Nutricionista RT', img: 'https://i.pravatar.cc/150?u=1', text: 'O NutriAssist revolucionou a forma como elaboro cardápio. O que levava dias, hoje faço em minutos com segurança total.' },
              { name: 'Ricardo Santos', role: 'Gestor de Merenda', img: 'https://i.pravatar.cc/150?u=2', text: 'Finalmente temos rastro real do nosso estoque. O desperdício caiu 30% no primeiro semestre de uso do sistema.' },
              { name: 'Juliana Paes', role: 'Técnica de Educação', img: 'https://i.pravatar.cc/150?u=3', text: 'A padronização dos pareceres deu uma segurança jurídica incrível para nossa secretaria. Excelente ferramenta.' }
            ].map((user, i) => (
              <div key={i} className="p-10 rounded-[40px] bg-slate-50 border border-slate-100 space-y-6 flex flex-col">
                <div className="flex-1">
                  <span className="text-4xl text-emerald-200 mb-4 block">"</span>
                  <p className="text-slate-600 text-sm italic font-medium leading-relaxed">
                    {user.text}
                  </p>
                </div>
                <div className="flex items-center gap-4 pt-6 border-t border-slate-200/50">
                  <img src={user.img} className="w-12 h-12 rounded-2xl grayscale" alt={user.name} loading="lazy" />
                  <div>
                    <p className="text-xs font-black text-slate-900 uppercase tracking-tighter">{user.name}</p>
                    <p className="text-[10px] text-emerald-600 font-bold uppercase">{user.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-24 bg-slate-50/50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em]">Dúvidas Frequentes</h2>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">Perguntas Comuns</h3>
          </div>
          <div className="space-y-6">
            {[
              { q: "O NutriAssist é gratuito?", a: "Sim, o NutriAssist oferece uma versão gratuita para demonstração e pequenas redes municipais, com foco na conformidade ao PNAE." },
              { q: "O sistema segue as normas do FNDE?", a: "Sim, todo o motor de cálculo e gerador de documentos foi treinado especificamente nas resoluções vigentes do FNDE e normas do PNAE." },
              { q: "Como é feito o controle de estoque?", a: "O sistema utiliza algoritmos de PEPS (Primeiro que Entra, Primeiro que Sai) e envia alertas automáticos de vencimento e estoque baixo." }
            ].map((faq, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-3">{faq.q}</h4>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto bg-emerald-600 rounded-[50px] p-12 lg:p-20 text-center text-white space-y-10 shadow-2xl shadow-emerald-200 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10 space-y-6">
            <h2 className="text-4xl lg:text-6xl font-black tracking-tighter leading-tight">
              Pronto para elevar o nível <br /> da sua nutrição escolar?
            </h2>
            <p className="text-emerald-100 text-lg font-medium opacity-80">
              Junte-se a centenas de profissionais que já automatizaram sua rotina.
            </p>
          </div>
          <button
            onClick={onEnterSystem}
            className="relative z-10 bg-white text-emerald-700 px-12 py-5 rounded-3xl text-sm font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-2xl active:scale-95"
          >
            Começar Agora - É Grátis
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contato" className="py-20 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-16">
          <div className="col-span-1 md:col-span-2 space-y-8">
            <div className="flex items-center gap-2">
              <span className="text-3xl">🥗</span>
              <span className="text-xl font-black tracking-tighter text-slate-900">NutriAssist<span className="text-emerald-600">.</span></span>
            </div>
            <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-sm">
              Desenvolvido com foco na realidade da gestão pública brasileira, priorizando acessibilidade e conformidade técnica institucional.
            </p>
            <div className="flex gap-4">
              {['𝕏', '📸', '💼'].map(social => (
                <button key={social} className="w-10 h-10 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-100 transition-all">
                  {social}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Navegação</h4>
            <ul className="space-y-3 text-sm font-bold text-slate-400">
              <li><a href="#" className="hover:text-emerald-600 transition-colors">Página Inicial</a></li>
              <li><a href="#funcionalidades" className="hover:text-emerald-600 transition-colors">Funcionalidades</a></li>
              <li><a href="#preview" className="hover:text-emerald-600 transition-colors">Sobre o Sistema</a></li>
              <li><a href="#depoimentos" className="hover:text-emerald-600 transition-colors">Privacidade</a></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Contato</h4>
            <div className="space-y-3 text-sm font-bold text-slate-400">
              <p>suporte@nutriassist.gov</p>
              <p>(77) 99129-0375</p>
              <p>{letterhead.municipio || 'Brotas de Macaúbas'}, {letterhead.uf || 'BA'}</p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 mt-20 pt-10 border-t border-slate-50 text-center space-y-4">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">© {new Date().getFullYear()} NutriAssist • {letterhead.secretaria || 'Secretaria Municipal de Educação'}</p>
          <p className="text-[8px] font-bold text-slate-200 uppercase tracking-[0.1em]">Última atualização do sistema: {new Date().toLocaleDateString('pt-BR')}</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
