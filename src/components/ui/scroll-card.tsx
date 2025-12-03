import { Quote } from 'lucide-react';

interface Testimonial {
  name: string;
  role: string;
  content: string;
  gradient: string;
}

const testimonials: Testimonial[] = [
  {
    name: 'Ana Luiza',
    role: 'Estudante - 17 anos',
    content:
      'O chat da Enem AI é simplesmente genial. A IA explica os assuntos do ENEM de um jeito fácil de entender e sem enrolação. Melhorou muito minhas notas em Química!',
    gradient: 'from-purple-500/20 to-blue-500/20',
  },
  {
    name: 'Gustavo Ramos',
    role: 'Estudante - 18 anos',
    content:
      'Finalmente uma plataforma que une professores e alunos de verdade. As comunidades deixam o estudo muito mais dinâmico e eu não me sinto estudando sozinho.',
    gradient: 'from-pink-500/20 to-rose-500/20',
  },
  {
    name: 'Mariana Torres',
    role: 'Estudante - 16 anos',
    content:
      'As anotações inteligentes são o diferencial. A IA lembra do que eu escrevi e usa isso pra me ajudar melhor depois. O grafo de conhecimento é incrível para revisar.',
    gradient: 'from-amber-500/20 to-orange-500/20',
  },
  {
    name: 'Rafael Almeida',
    role: 'Pré-vestibulando - 19 anos',
    content:
      'Estudar com a Enem AI é como ter um tutor pessoal 24h por dia. Tudo é direto, prático e feito pra quem quer aprender de verdade. A correção de redação é perfeita.',
    gradient: 'from-emerald-500/20 to-green-500/20',
  },
];

export default function ScrollCard() {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-20">
      <div className="flex flex-col md:flex-row gap-12 items-start">
        {/* Sticky Title Section */}
        <div className="md:w-1/3 sticky top-32 self-start">
          <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 mb-6 leading-tight">
            O que dizem <br /> sobre nós
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed">
            Veja como o EnemAI está transformando a rotina de estudos de estudantes em todo o Brasil com tecnologia e comunidade.
          </p>

          <div className="mt-8 flex items-center gap-2 text-sm text-gray-500">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-8 h-8 rounded-full bg-gray-800 border-2 border-gray-950 flex items-center justify-center text-xs">
                  User
                </div>
              ))}
            </div>
            <span>+2.000 estudantes ativos</span>
          </div>
        </div>

        {/* Scrolling Cards Section */}
        <div className="md:w-2/3 relative">
          {testimonials.map((card, i) => (
            <div
              key={i}
              className="sticky top-32 mb-8 last:mb-0"
              style={{
                // Add a slight offset for each card so they don't perfectly overlap if desired, 
                // or keep them at top-32 for perfect stacking.
                // Let's add a small top offset increment to make them "stack" visually
                top: `calc(8rem + ${i * 1}rem)`
              }}
            >
              <div className={`
                        relative overflow-hidden
                        bg-gray-900/80 backdrop-blur-xl 
                        border border-white/10 
                        p-8 md:p-10 rounded-3xl 
                        shadow-2xl
                        transition-transform duration-500
                    `}>
                {/* Gradient Background Blob */}
                <div className={`absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br ${card.gradient} blur-3xl opacity-50 rounded-full pointer-events-none`} />

                <Quote className="w-10 h-10 text-purple-500/50 mb-6" />

                <p className="text-xl md:text-2xl text-gray-200 leading-relaxed mb-8 relative z-10">
                  "{card.content}"
                </p>

                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white font-bold text-lg`}>
                    {card.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{card.name}</h4>
                    <p className="text-sm text-gray-400">{card.role}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Spacer to allow scrolling past the last card */}
          <div className="h-20" />
        </div>
      </div>
    </div>
  );
}
