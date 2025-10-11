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

interface Testimonial {
  id: number;
  name: string;
  role: string;
  avatar: string;
  content: string;
  rating: number;
}

const articleCardsData: ArticleCardData[] = [
  {
    title: 'Image MouseTrail',
    description:
      "An Mouse who is running with couple of images and the best part is you can hide all the images when you don't move your mouse. I hope you'll love it",
    link: 'https://ui-layout.com/components/image-mousetrail',
    color: '#E0E0E0', // Light Gray
    rotation: 'rotate-6',
  },
  {
    title: 'Progressive Carousel',
    description:
      'Lorem ipsum dolor sit amet consectetur adipisicing elit. Eius consequatur explicabo assumenda odit necessitatibus possimus ducimus aliquam. Ullam dignissimos animi officiis, in sequi et inventore harum ipsam sed.',
    link: 'https://ui-layout.com/components/progressive-carousel',
    color: '#C0C0C0', // Medium Gray
    rotation: 'rotate-0',
  },
  {
    title: 'Responsive Drawer',
    description:
      'Lorem ipsum dolor sit amet consectetur adipisicing elit. Eius consequatur explicabo assumenda odit necessitatibus possimus ducimus aliquam. Ullam dignissimos animi officiis, in sequi et inventore harum ipsam sed.',
    link: 'https://ui-layout.com/components/drawer',
    color: '#A0A0A0', // Darker Gray
    rotation: '-rotate-6',
  },
  {
    title: 'Animated Globe',
    description:
      'Lorem ipsum dolor sit amet consectetur adipisicing elit. Eius consequatur explicabo assumenda odit necessitatibus possimus ducimus aliquam. Ullam dignissimos animi officiis, in sequi et inventore harum ipsam sed.',
    link: 'https://ui-layout.com/components/globe',
    color: '#808080', // Even Darker Gray
    rotation: 'rotate-0',
  },
];

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Ana Silva',
    role: 'Estudante de Ensino Médio',
    avatar: '👩‍🎓',
    content: 'O Enem AI mudou completamente minha forma de estudar! O chat com IA me ajudou a entender conceitos difíceis de matemática e as anotações inteligentes organizam todo meu material de estudo.',
    rating: 5
  },
  {
    id: 2,
    name: 'Carlos Mendes',
    role: 'Professor de Física',
    avatar: '👨‍🏫',
    content: 'Como professor, recomendo o Enem AI para meus alunos. A plataforma oferece recursos excelentes para aprendizado e a comunidade ajuda muito na troca de conhecimentos.',
    rating: 5
  },
  {
    id: 3,
    name: 'Maria Oliveira',
    role: 'Estudante de Ensino Médio',
    avatar: '👩‍🎓',
    content: 'Minhas notas no simulado melhoraram 30% depois que comecei a usar o Enem AI. O chat com agentes especializados é incrível e me dá respostas rápidas e precisas.',
    rating: 5
  },
  {
    id: 4,
    name: 'Pedro Santos',
    role: 'Estudante de Ensino Médio',
    avatar: '👨‍🎓',
    content: 'A melhor parte é a organização das anotações. Posso adicionar tags, exportar para PDF e o sistema de busca é muito eficiente. Recomendo para todos!',
    rating: 4
  },
  {
    id: 5,
    name: 'Juliana Costa',
    role: 'Estudante de Ensino Médio',
    avatar: '👩‍🎓',
    content: 'A comunidade do Enem AI é fantástica! Conheci outros estudantes e trocamos dicas de estudo. O chat com IA me ajudou a passar em vestibulares difíceis.',
    rating: 5
  }
];

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-400'}>
          ⭐
        </span>
      ))}
    </div>
  );
};

const Component = forwardRef<HTMLElement>((props, ref) => {
  return (
    <ReactLenis root>
      <main className='bg-black' ref={ref}>
        <div className='wrapper'>
          <section className='text-white h-screen w-full bg-slate-950 grid place-content-center sticky top-0'>
            <div className='absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:54px_54px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]'></div>

            <h1 className='2xl:text-7xl text-5xl px-8 font-semibold text-center tracking-tight leading-[120%]'>
              CSS Sticky Properties for <br /> Stacking Cards. Scroll down! 👇
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
                    <h1 className='text-2xl font-semibold'>{card.title}</h1>
                    <p>{card.description}</p>
                    <a
                      href={card.link}
                      target='_blank'
                      className='w-fit bg-black p-3 rounded-md cursor-pointer text-white'
                    >
                      Click to View
                    </a>
                  </article>
                </figure>
              ))}
            </div>
            <div className='sticky top-0 h-screen grid place-content-center'>
              <h1 className='text-4xl px-8 font-medium text-center tracking-tight leading-[120%]'>
                What We <br /> Have Now😎
              </h1>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className='text-white w-full bg-slate-950 py-20'>
          <div className='max-w-6xl mx-auto px-16'>
            <h2 className='text-4xl font-bold text-center mb-12'>O que nossos usuários dizem</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className='bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700'>
                  <div className='flex items-center mb-4'>
                    <div className='text-3xl mr-3'>{testimonial.avatar}</div>
                    <div>
                      <h3 className='font-semibold text-white'>{testimonial.name}</h3>
                      <p className='text-sm text-gray-400'>{testimonial.role}</p>
                    </div>
                  </div>
                  <StarRating rating={testimonial.rating} />
                  <p className='text-gray-300 mt-4 italic'>"{testimonial.content}"</p>
                </div>
              ))}
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