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
    color: '#C0C0C0',
    rotation: 'rotate-6',
  },
  {
    title: 'Gustavo Ramos, 18 anos',
    description:
      'Finalmente uma plataforma que une professores e alunos de verdade. As comunidades deixam o estudo muito mais dinâmico.',
    link: 'https://ui-layout.com/components/progressive-carousel',
    color: '#C0C0C0',
    rotation: 'rotate-0',
  },
  {
    title: 'Mariana Torres, 16 anos',
    description:
      'As anotações inteligentes são o diferencial. A IA lembra do que eu escrevi e usa isso pra me ajudar melhor depois.',
    link: 'https://ui-layout.com/components/drawer',
    color: '#A0A0A0',
    rotation: '-rotate-6',
  },
  {
    title: 'Rafael Almeida, 19 anos',
    description:
      'Estudar com a Enem AI é como ter um tutor pessoal 24h por dia. Tudo é direto, prático e feito pra quem quer aprender de verdade.',
    link: 'https://ui-layout.com/components/globe',
    color: '#808080',
    rotation: 'rotate-0',
  },
];

const Component = forwardRef<HTMLElement, unknown>((_props, ref) => {
  return (
    <ReactLenis root>
      {/* main agora usa bg-slate-950 para garantir cor uniforme em toda a página */}
      <main className="relative bg-slate-950 text-white overflow-x-hidden" ref={ref}>
        {/* Background full-viewport — garante largura total independente de containers */}
        <div
          aria-hidden
          className="absolute inset-0 left-1/2 -translate-x-1/2 w-screen -z-30 pointer-events-none"
        >
          {/* Base sólido: cor idêntica a bg-slate-950 */}
          <div className="absolute inset-0 bg-slate-950" />

          {/* Blur superior — gradiente + blur para suavizar a borda de cima */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-screen h-40 -z-20 pointer-events-none"
            style={{
              background:
                'linear-gradient(180deg, rgba(15,23,32,1) 0%, rgba(15,23,32,0) 60%)',
              filter: 'blur(24px)',
            }}
          />

          {/* Blur inferior — gradiente + blur para suavizar a borda de baixo */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-screen h-40 -z-20 pointer-events-none"
            style={{
              background:
                'linear-gradient(0deg, rgba(15,23,32,1) 0%, rgba(15,23,32,0) 60%)',
              filter: 'blur(24px)',
            }}
          />
        </div>

        {/* HERO (continua com conteúdo centralizado, sem quebrar o bg full-width) */}
        <div className="wrapper">
          <section className="relative h-screen w-full grid place-content-center">
            {/* conteúdo do hero — z-10 para ficar acima do background */}
            <div className="z-10">
              {/* coloca algo aqui se quiser */}
            </div>
          </section>
        </div>

        {/* SEÇÃO PRINCIPAL: conteúdo com background já coberto pelo elemento global acima */}
        <section className="relative w-full">
          <div className="flex justify-between px-16">
            <div className="grid gap-2">
              {articleCardsData.map((card, i) => (
                // mantém o sticky de cada card (card stacking intacto)
                <figure key={i} className="sticky top-0 h-screen grid place-content-center">
                  <article
                    className={`h-72 w-[30rem] rounded-lg ${card.rotation} p-4 grid place-content-center gap-4 z-10`}
                    style={{ backgroundColor: card.color }}
                  >
                    <h1 className="text-2xl font-semibold">{card.title}</h1>
                    <p>{card.description}</p>
                  </article>
                </figure>
              ))}
            </div>

            <div className="sticky top-0 h-screen grid place-content-center z-10">
              <h1 className="text-4xl px-8 font-medium text-center tracking-tight leading-[120%]">
                O que os nossos <br /> usuários falam
              </h1>
            </div>
          </div>
        </section>
      </main>
    </ReactLenis>
  );
});

Component.displayName = 'Component';

export default Component;
