'use client';
import { ReactLenis } from 'lenis/react';
import React, { useRef, forwardRef } from 'react';
import UserReview from './user-review';

interface ArticleCardData {
  title: string;
  description: string;
  link: string;
  color: string;
  rotation: string;
}

const articleCardsData: ArticleCardData[] = [
  {
    title: 'Chat com IA',
    description:
      'Converse com agentes especializados em cada área do ENEM. Obtenha explicações detalhadas, resolução de exercícios e simulados personalizados.',
    link: '#chat',
    color: '#8B5CF6', // Purple
    rotation: 'rotate-6',
  },
  {
    title: 'Anotações Inteligentes',
    description:
      'Crie anotações organizadas com tags, exporte para PDF, e utilize ferramentas de edição avançadas. Sistema de salvamento automático.',
    link: '#notes',
    color: '#A855F7', // Pink
    rotation: 'rotate-0',
  },
  {
    title: 'Comunidade',
    description:
      'Conecte-se com estudantes e professores. Partilhe materiais, participe de discussões e construa uma rede de apoio.',
    link: '#community',
    color: '#C084FC', // Light Purple
    rotation: '-rotate-6',
  },
  {
    title: 'Avaliações de Usuários',
    description:
      'Veja o que nossos usuários estão dizendo sobre a plataforma e como o Enem AI está transformando a preparação para o ENEM.',
    link: '#reviews',
    color: '#E879F9', // Lighter Purple
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

            <h1 className='2xl:text-7xl text-5xl px-8 font-semibold text-center tracking-tight leading-[120%]'>
              Descubra o Enem AI <br /> e transforme seus estudos! 👇
            </h1>
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
                    <h1 className='text-2xl font-semibold text-white'>{card.title}</h1>
                    <p className='text-white/90'>{card.description}</p>
                    <a
                      href={card.link}
                      className='w-fit bg-black/30 p-3 rounded-md cursor-pointer text-white hover:bg-black/50 transition-colors'
                    >
                      Saiba Mais
                    </a>
                  </article>
                </figure>
              ))}
            </div>
            <div className='sticky top-0 h-screen grid place-content-center'>
              <h1 className='text-4xl px-8 font-medium text-center tracking-tight leading-[120%]'>
                Recursos <br /> Exclusivos 😎
              </h1>
            </div>
          </div>
        </section>

        {/* User Reviews Section */}
        <section className='text-white w-full bg-slate-950 py-20'>
          <div className='max-w-6xl mx-auto px-16'>
            <h2 className='text-4xl font-bold text-center mb-12'>O que nossos usuários dizem</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
              <UserReview review={userReviews[0]} />
              <UserReview review={userReviews[1]} />
              <UserReview review={userReviews[2]} />
              <UserReview review={userReviews[3]} />
            </div>
          </div>
        </section>

        <footer className='group bg-slate-950 '>
          <h1 className='text-[16vw] translate-y-20 leading-[100%] uppercase font-semibold text-center bg-gradient-to-r from-purple-400 to-purple-800 bg-clip-text text-transparent transition-all ease-linear'>
            Enem AI
          </h1>
          <div className='bg-black h-40 relative z-10 grid place-content-center text-2xl rounded-tr-full rounded-tl-full text-white'></div>
        </footer>
      </main>
    </ReactLenis>
  );
});

Component.displayName = 'Component';

export default Component;