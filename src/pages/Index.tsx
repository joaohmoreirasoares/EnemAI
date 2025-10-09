import React from 'react';
import CircularGallery from '@/components/CircularGallery';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          Avaliações de Estudantes
        </h1>
        <CircularGallery
          items={[
            {
              text: 'O chat da IA me ajudou a entender conceitos difíceis de Matemática que eu nunca tinha conseguido antes!'
            },
            {
              text: 'As anotações inteligentes revolucionaram minha forma de estudar. Organização perfeita!'
            },
            {
              text: 'A comunidade é incrível, consegui tirar todas minhas dúvidas de Química com outros estudantes.'
            },
            {
              text: 'Os simulados personalizados me mostraram exatamente onde preciso melhorar. Recomendo!'
            },
            {
              text: 'Finalmente entendi como fazer uma boa redação graças aos feedbacks detalhados da plataforma.'
            }
          ]}
          bend={200}
          textColor="#ffffff"
        />
      </div>
    </div>
  );
};

export default Index; // Exportação padrão adicionada