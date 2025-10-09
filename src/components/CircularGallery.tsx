interface CircularGalleryProps {
  items: {
    image: string;
    text: string;
  }[];
  bend?: number;
  borderRadius?: number;
  scrollSpeed?: number;
  scrollEase?: number;
  textColor?: string; // Adicionar esta linha
  font?: string; // Adicionar também se necessário
}