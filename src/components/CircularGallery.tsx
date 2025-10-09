import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } from 'ogl';
import { useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';

// Função para criar textura a partir de HTML
async function createHTMLTexture(gl: any, html: string, width: number, height: number): Promise<Texture> {
  // Criar container temporário
  const container = document.createElement('div');
  container.style.width = `${width}px`;
  container.style.height = `${height}px`;
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.innerHTML = html;
  
  document.body.appendChild(container);
  
  try {
    // Renderizar HTML para canvas
    const canvas = await html2canvas(container, {
      scale: 1,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null
    });
    
    document.body.removeChild(container);
    
    // Criar textura OGL
    const texture = new Texture(gl, {
      generateMipmaps: false,
      width: canvas.width,
      height: canvas.height
    });
    texture.image = canvas;
    
    return texture;
  } catch (error) {
    document.body.removeChild(container);
    throw error;
  }
}

class Media {
  element: HTMLElement;
  gl: any;
  scene: Transform;
  mesh: Mesh;
  program: Program;
  bounds: any;
  texture: Texture | null = null;
  width: number = 800;
  height: number = 600;

  constructor({ element, gl, scene }: { element: HTMLElement, gl: any, scene: Transform }) {
    this.element = element;
    this.gl = gl;
    this.scene = scene;
    
    this.createBounds();
    this.createMesh();
  }

  createBounds() {
    this.bounds = this.element.getBoundingClientRect();
  }

  async createTexture() {
    const htmlContent = this.element.innerHTML;
    this.texture = await createHTMLTexture(this.gl, htmlContent, this.width, this.height);
  }

  createMesh() {
    const geometry = new Plane(this.gl);
    
    this.program = new Program(this.gl, {
      vertex: `
        attribute vec2 uv;
        attribute vec3 position;
        
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        
        varying vec2 vUv;
        
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        
        uniform sampler2D tMap;
        
        varying vec2 vUv;
        
        void main() {
          vec4 texture = texture2D(tMap, vUv);
          gl_FragColor = texture;
        }
      `,
      uniforms: {
        tMap: { value: this.texture }
      },
      transparent: true
    });

    this.mesh = new Mesh(this.gl, { geometry, program: this.program });
    this.mesh.setParent(this.scene);
  }

  async update() {
    await this.createTexture();
    this.program.uniforms.tMap.value = this.texture;
  }

  onResize() {
    this.createBounds();
  }
}

interface CircularGalleryProps {
  items?: { id: string; content: string }[];
  width?: number;
  height?: number;
  radius?: number;
  bend?: number;
}

export default function CircularGallery({
  items = [],
  width = 800,
  height = 600,
  radius = 500,
  bend = 0.5
}: CircularGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<Renderer>();
  const sceneRef = useRef<Transform>();
  const cameraRef = useRef<Camera>();
  const mediaItemsRef = useRef<Media[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Inicializar renderer OGL
    const renderer = new Renderer({
      alpha: true,
      width,
      height
    });
    rendererRef.current = renderer;
    
    const gl = renderer.gl;
    containerRef.current.appendChild(gl.canvas);

    // Configurar cena e câmera
    const scene = new Transform();
    sceneRef.current = scene;
    
    const camera = new Camera(gl);
    camera.position.z = 1000;
    cameraRef.current = camera;

    // Criar elementos HTML para cada item
    items.forEach((item, i) => {
      const angle = (i / items.length) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      const div = document.createElement('div');
      div.innerHTML = item.content;
      div.style.display = 'none'; // Esconder do DOM normal
      
      const media = new Media({
        element: div,
        gl,
        scene
      });
      
      media.mesh.position.set(x, y, 0);
      mediaItemsRef.current.push(media);
    });

    // Carregar texturas assincronamente
    const loadTextures = async () => {
      for (const media of mediaItemsRef.current) {
        await media.update();
      }
    };
    
    loadTextures().then(() => {
      // Animação
      const animate = () => {
        requestAnimationFrame(animate);
        renderer.render({ scene, camera });
      };
      animate();
    });

    return () => {
      if (containerRef.current && gl.canvas) {
        containerRef.current.removeChild(gl.canvas);
      }
    };
  }, [items, radius, width, height]);

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: `${width}px`, 
        height: `${height}px`,
        position: 'relative'
      }}
    />
  );
}