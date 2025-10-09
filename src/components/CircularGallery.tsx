// ... (código anterior permanece igual)

// Main gallery app class
interface AppConfig {
  bend?: number;
  borderRadius?: number;
  scrollSpeed?: number;
  scrollEase?: number;
  itemCount: number; // Nova propriedade
}

class CircularGalleryApp {
  // ... (restante do código permanece igual)

  constructor(
    container: HTMLElement,
    {
      bend = 1,
      borderRadius = 0,
      scrollSpeed = 2,
      scrollEase = 0.05,
      itemCount = 10 // Valor padrão atualizado
    }: AppConfig
  ) {
    // ... (código anterior permanece igual)
    
    this.createCards(bend, borderRadius, itemCount); // Passando itemCount
  }

  // Atualizado para receber itemCount
  createCards(bend: number, borderRadius: number, itemCount: number) {
    this.cards = Array.from({ length: itemCount }, (_, index) => {
      return new Card({
        // ... (parâmetros anteriores)
      });
    });
  }

  // ... (restante do código permanece igual)
}