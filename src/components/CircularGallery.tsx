// ... (código anterior)

// Alterar de:
// export function CircularGallery(...) {...}

// Para:
export default function CircularGallery({
  items,
  bend = 3,
  borderRadius = 0.05,
  scrollSpeed = 2,
  scrollEase = 0.05
}: CircularGalleryProps) {
  // ... (implementação permanece igual)
}