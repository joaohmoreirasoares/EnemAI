'use client';
import { ReactLenis } from 'lenis/react';
import React, { useRef, forwardRef } from 'react';

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
      "O chat da Enem AI é simplesmente genial. A IA explica os assuntos do ENEM de um jeito fácil de entender e sem enrolação.",
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

const Component = forwardRef<HTMLElement>((props, ref) => {
  return (
    <ReactLenis root>
      <main className='bg-black' ref={ref}>
        <div className='wrapper'>
          <section className='text-white h-screen w-full bg-slate-950 grid place-content-center sticky top-0'>
            <div className='absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:54px_54px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]'></div>


          </section>
        </div>

        <section className='text-white w-full bg-slate-950'>
          <div className='flex justify-between px-16'>
            <div className='grid gap-2'>
              {articleCardsData.map((card, i) => (
                <figure key={i} className='sticky top-0 h-screen grid place-content-center'>
                  <article
                    className={`${card.color} h-72 w-[30rem] rounded-lg ${card.rotation} p-4 grid place-content-center gap-4`}
                    style={{ backgroundColor: card.color }}
                  >
                    <h1 className='text-2xl font-semibold'>{card.title}</h1>
                    <p>{card.description}</p>

                  </article>
                </figure>
              ))}
            </div>
            <div className='sticky top-0 h-screen grid place-content-center'>
              <h1 className='text-4xl px-8 font-medium text-center tracking-tight leading-[120%]'>
                O que os nossos <br /> usuários falam
              </h1>
            </div>
          </div>
        </section>

        <footer className='group bg-slate-950 '>
          <h1 className='text-[16vw] translate-y-20 leading-[100%] uppercase font-semibold text-center bg-gradient-to-r from-gray-400 to-gray-800 bg-clip-text text-transparent transition-all ease-linear'>
            ui-layout
          </h1>
          <div className='bg-black h-40 relative z-10 grid place-content-center text-2xl rounded-tr-full rounded-tl-full text-white'></div>
        </footer>
      </main>
    </ReactLenis>
  );
});

Component.displayName = 'Component';

export default Component;