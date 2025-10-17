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
      <main className="relative bg-black min-h-screen overflow-hidden" ref={ref}>
        {/* BACKGROUND FULL WIDTH */}
        <div className="absolute inset-0 w-screen h-full bg-slate-950">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:54px_54px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        </div>

        {/* CONTEÚDO */}
        <section className="relative text-white w-full min-h-screen flex items-center justify-center">
          <h1 className="text-5xl font-bold text-center z-10">
            O que os nossos usuários falam
          </h1>
        </section>

        <section className="relative text-white w-full bg-slate-950">
          <div className="flex justify-between px-16 max-w-none w-full">
            <div className="grid gap-2 w-full">
              {articleCardsData.map((card, i) => (
                <figure
                  key={i}
                  className="sticky top-0 h-screen grid place-content-center w-full"
                >
                  <article
                    className={`h-72 w-[30rem] rounded-lg ${card.rotation} p-4 grid place-content-center gap-4 mx-auto`}
                    style={{ backgroundColor: card.color }}
                  >
                    <h1 className="text-2xl font-semibold">{card.title}</h1>
                    <p>{card.description}</p>
                  </article>
                </figure>
              ))}
            </div>

            <div className="sticky top-0 h-screen grid place-content-center px-8">
              <h1 className="text-4xl font-medium text-center tracking-tight leading-[120%]">
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
