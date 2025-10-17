import React from 'react';

const ScrollCard = () => {
  const articleCardsData = [
    { title: 'Card 1', description: 'Description 1' },
    { title: 'Card 2', description: 'Description 2' },
    { title: 'Card 3', description: 'Description 3' },
  ];

  return (
    <section className='text-white w-full bg-slate-950'>
      <div className='flex justify-between px-16 w-full min-w-screen'>
        <div className='grid gap-2'>
          {articleCardsData.map((card, i) => (
            <figure key={i} className='sticky top-0 h-screen grid place-content-center'>
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-semibold">{card.title}</h3>
                <p className="text-gray-300">{card.description}</p>
              </div>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ScrollCard;