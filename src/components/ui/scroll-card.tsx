'use client';
import { ReactLenis } from 'lenis/react';
import React, { forwardRef } from 'react';

interface ArticleCardData {
  title: string;
  description: string;
  link: string;
  color: string;
  rotation: string;
}

const articleCardsData: ArticleCardData[] = [
  {
    title: 'Ana Luiza, 17 anos',
    description:
      'O chat da Enem AI é simplesmente genial. A IA explica os assuntos do ENEM de um jeito fácil de entender e sem enrolação.',
    link: 'https://ui-layout.com/components/image-mousetrail',
    color: '#C0C0C0', // Medium Gray
    rotation: 'rotate-6',
  },
  {
    title: 'Gustavo Ramos, 18 anos',
    description:
      'Finalmente uma plataforma que une professores e alunos de verdade. As comunidades deixam o estudo muito mais dinâmico.',
    link: 'https://ui-layout.com/components/progressive-carousel',
    color: '#C0C0C0', // Medium Gray
    rotation: 'rotate-0',
  },
  {
    title: 'Mariana Torres, 16 anos',
    description:
      'As anotações inteligentes são o diferencial. A IA lembra do que eu escrevi e usa isso pra me ajudar melhor depois.',
    link: 'https://ui-layout.com/components/drawer',
    color: '#A0A0A0', // Darker Gray
    rotation: '-rotate-6',
  },
  {
    title: 'Rafael Almeida, 19 anos',
    description:
      'Estudar com a Enem AI é como ter um tutor pessoal 24h por dia. Tudo é direto, prático e feito pra quem quer aprender de verdade.',
    link: 'https://ui-layout.com/components/globe',
    color: '#808080', // Even Darker Gray
    rotation: 'rotate-0',
  },
];

const Component = forwardRef<HTMLElement, unknown>((_props, ref) => {
  // estilo para o padrão quadriculado (repeating lines)
  const patternStyle: React.CSSProperties = {
    backgroundImage:
      'linear-gradient(to right, rgba(79,79,79,0.18) 0 1px, transparent 1px), linear-gradient(to bottom, rgba(79,79,79,0.18) 0 1px, transparent 1px)',
    backgroundSize: '54px 54px, 54px 54px',
    opacity: 0.9,
  };

  return (
    <ReactLenis root>
      {/* overflow-x-hidden para evitar micro-overflows horizontais */}
      <main className="bg-black relative overflow-x-hidden" ref={ref}>
        {/* ===== Background full-width (único, por toda a página) ===== */}
        {/* Camada sólida base: garante cor uniforme */}
        <div className="absolute inset-0 left-1/2 -translate-x-1/2 w-screen -z-30 pointer-events-none bg-slate-950" />

        {/* Camada de padrão (linhas) por cima da base */}
        <div
          className="absolute inset-0 left-1/2 -translate-x-1/2 w-screen -z-20 pointer-events-none"
          style={patternStyle}
        />

        {/* Blur suave no topo (extremidade superior) */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-screen h-36 -z-10 pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, rgba(15,23,42,1), rgba(15,23,42,0))',
            filter: 'blur(18px)',
          }}
        />

        {/* Blur suave na base (extremidade inferior) */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-screen h-36 -z-10 pointer-events-none"
          style={{
            background: 'linear-gradient(0deg, rgba(15,23,42,1), rgba(15,23,42,0))',
            filter: 'blur(18px)',
          }}
        />

        {/* Conteúdo — sempre acima das camadas de background */}
        <div className="relative z-10">
          <div className="wrapper">
            {/* HERO: sem bg local — o background global responde por tudo */}
            <section className="text-white h-screen w-full grid place-content-center sticky top-0">
              <div className="z-10">
                {/* conteúdo do hero (se precisar) */}
              </div>
            </section>
          </div>

          {/* SEÇÃO PRINCIPAL (transparente: deixa o background global aparecer) */}
          <section className="text-white w-full">
            <div className="flex justify-between px-16">
              <div className="grid gap-2">
                {articleCardsData.map((card, i) => (
                  <figure key={i} className="sticky top-0 h-screen grid place-content-center">
                    <article
                      className={`h-72 w-[30rem] rounded-lg ${card.rotation} p-4 grid place-content-center gap-4`}
                      style={{ backgroundColor: card.color }}
                    >
                      <h1 className="text-2xl font-semibold">{card.title}</h1>
                      <p>{card.description}</p>
                    </article>
                  </figure>
                ))}
              </div>

              <div className="sticky top-0 h-screen grid place-content-center">
                <h1 className="text-4xl px-8 font-medium text-center tracking-tight leading-[120%]">
                  O que os nossos <br /> usuários falam
                </h1>
              </div>
            </div>
          </section>
        </div>
      </main>
    </ReactLenis>
  );
});

Component.displayName = 'Component';

export default Component;
