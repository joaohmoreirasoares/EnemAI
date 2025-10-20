"use client";

import React from 'react';

const ScrollCard = () => {
  return (
    <div className="relative">
      {/* HERO: fundo em tela cheia (pattern) */}
      <section className="relative text-white h-0 w-full grid place-content-center sticky top-0">
        {/* Full-viewport background — garante 100% da largura da viewport */}
        <div
          className="absolute inset-0 left-1/2 -translate-x-1/2 w-screen pointer-events-none -z-10"
        >
          {/* Pattern de fundo com gradiente e blur */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-pink-800 opacity-70" />
          
          {/* Camada de blur para suavizar o padrão */}
          <div className="absolute inset-0 backdrop-blur-[2px]" />
        </div>

        {/* Conteúdo principal do hero */}
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Transforme sua <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">aprendizagem</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
            Plataforma educacional interativa para estudantes de engenharia
          </p>
        </div>
      </section>

      {/* Conteúdo principal */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4">Recursos Principais</h2>
            <ul className="space-y-4 text-gray-700">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                Aulas interativas e dinâmicas
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                Material de estudo personalizado
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-pink-500 rounded-full mr-3"></div>
                Comunidade de estudantes engajada
              </li>
            </ul>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Próximos Eventos</h3>
            <div className="space-y-3">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-medium">Seminário de Machine Learning</h4>
                <p className="text-sm text-gray-600">15 de março, 14:00</p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-medium">Workshop de Robótica</h4>
                <p className="text-sm text-gray-600">22 de março, 10:00</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrollCard;