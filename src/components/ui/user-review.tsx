import { Star } from 'lucide-react';

interface UserReview {
  id: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
}

const userReviews: UserReview[] = [
  {
    id: '1',
    name: 'Maria Silva',
    role: 'Estudante',
    avatar: 'https://picsum.photos/seed/user1/100/100',
    rating: 5,
    comment: 'O Enem AI mudou completamente minha forma de estudar! O chat com IA me ajudou a entender conceitos difíceis que eu nunca tinha conseguido antes.',
    date: '15 de novembro de 2024'
  },
  {
    id: '2',
    name: 'João Santos',
    role: 'Professor',
    avatar: 'https://picsum.photos/seed/user2/100/100',
    rating: 5,
    comment: 'Como professor, recomendo o Enem AI para meus alunos. A plataforma é completa e a qualidade do conteúdo gerado pela IA é excelente.',
    date: '10 de novembro de 2024'
  },
  {
    id: '3',
    name: 'Ana Paula',
    role: 'Estudante',
    avatar: 'https://picsum.photos/seed/user3/100/100',
    rating: 4,
    comment: 'Minhas notas melhoraram muito desde que comecei a usar o Enem AI. As anotações inteligentes são muito úteis para organizar meu estudo.',
    date: '5 de novembro de 2024'
  },
  {
    id: '4',
    name: 'Carlos Mendes',
    role: 'Estudante',
    avatar: 'https://picsum.photos/seed/user4/100/100',
    rating: 5,
    comment: 'A comunidade do Enem AI é fantástica! Consegui tirar muitas dúvidas e conhecer outros estudantes com os mesmos objetivos.',
    date: '2 de novembro de 2024'
  }
];

const UserReview = ({ review }: { review: UserReview }) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-600'
        }`}
      />
    ));
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
      <div className="flex items-start gap-4 mb-4">
        <img
          src={review.avatar}
          alt={review.name}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-semibold text-white">{review.name}</h4>
            <span className="text-sm text-gray-300">{review.role}</span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex">
              {renderStars(review.rating)}
            </div>
            <span className="text-sm text-gray-300">{review.date}</span>
          </div>
        </div>
      </div>
      <p className="text-gray-200 text-sm leading-relaxed">
        "{review.comment}"
      </p>
    </div>
  );
};

export default UserReview;