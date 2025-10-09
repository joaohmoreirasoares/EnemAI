import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } from 'ogl';
import { useEffect, useRef } from 'react';

// ... (funções auxiliares permanecem as mesmas)

function createHTMLTexture(
  gl: GL,
  html: string,
  width: number,
  height: number
): Texture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  
  if (!context) throw new Error('Could not get 2d context');
  
  // Renderizar HTML no canvas
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  tempDiv.style.position = 'absolute';
  tempDiv.style.width = `${width}px`;
  tempDiv.style.height = `${height}px`;
  document.body.appendChild(tempDiv);
  
  context.fillStyle = 'white';
  context.fillRect(0, 0, width, height);
  context.font = '30px Arial';
  context.fillStyle = 'black';
  
  // Capturar o conteúdo como imagem (simplificado)
  // Em produção, use bibliotecas como html2canvas
  context.fillText(tempDiv.textContent || '', 10, 50);
  
  document.body.removeChild(tempDiv);
  
  const texture = new Texture(gl, { generateMipmaps: false });
  texture.image = canvas;
  return texture;
}

interface MediaProps {
  // ... (outras props)
  htmlContent: string; // Nova prop para conteúdo HTML
}

class Media {
  // ... (código existente)

  createShader() {
    const texture = createHTMLTexture(
      this.gl,
      this.htmlContent, // Usar conteúdo HTML
      800, // Largura fixa para exemplo
      600  // Altura fixa para exemplo
    );

    this.program = new Program(this.gl, {
      // ... (restante do código do shader permanece igual)
      uniforms: {
        tMap: { value: texture },
        // ... (outros uniforms)
      }
    });
  }

  // ... (métodos restantes)
}

interface CircularGalleryProps {
  items?: { htmlContent: string; text: string }[]; // Nova estrutura
  // ... (outras props)
}

export default function CircularGallery({
  items = [
    {
      htmlContent: '&lt;div style="background: #8B5CF6; padding: 20px; border-radius: 10px;"&gt;Conteúdo HTML&lt;/div&gt;',
      text: 'Div Example'
    }
  ],
  // ... (outras props)
}: CircularGalleryProps) {
  // ... (código do componente permanece igual)
}