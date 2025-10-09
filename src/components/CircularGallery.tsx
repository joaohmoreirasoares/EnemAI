import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } from 'ogl';
import { useEffect, useRef } from 'react';

type GL = WebGLRenderingContext | WebGL2RenderingContext;

function createHTMLTexture(gl: GL, html: string, width: number, height: number): Promise<Texture> {
  return new Promise((resolve) => {
    const svgStr = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml" style="
            width: ${width}px;
            height: ${height}px;
            font-family: system-ui, sans-serif;
            padding: 20px;
            box-sizing: border-box;
          ">
            ${html}
          </div>
        </foreignObject>
      </svg>
    `;

    const
Aqui está a versão final corrigida do arquivo CircularGallery.tsx sem erros de sintaxe:

<dyad-write path="src/components/CircularGallery.tsx" description="Versão final corrigida do CircularGallery">
import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } from 'ogl';
import { useEffect, useRef } from 'react';

type GL = WebGLRenderingContext | WebGL2RenderingContext;

function createHTMLTexture(gl: GL, html: string, width: number, height: number): Promise<Texture> {
  return new Promise((resolve) => {
    const svgStr = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml" style="
            width: ${width}px;
            height: ${height}px;
            font-family: system-ui, sans-serif;
            padding: 20px;
            box-sizing: border-box;
          ">
            ${html}
          </div>
        </foreignObject>
      </svg>
    `;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      
      const texture = new Texture(gl, { generateMipmaps: false });
      texture.image = canvas;
      resolve(texture);
    };
    
    img.src = 'data:image/svg+xml,' + encodeURIComponent(svgStr);
  });
}

class Media {
  gl: GL;
  scene: Transform;
  mesh: Mesh | null = null;
  program: Program | null = null;
  htmlContent: string;
  width: number;
  height: number;
  ready: Promise<void>;

  constructor({ gl, scene, htmlContent, width = 512, height = 512 }: {
    gl: GL,
    scene: Transform,
    htmlContent: string,
    width?: number,
    height?: number
  }) {
    this.gl = gl;
    this.scene = scene;
    this.htmlContent = htmlContent;
    this.width = width;
    this.height = height;

    this.ready = this.createMesh();
  }

  async createMesh() {
    const geometry = new Plane(this.gl);
    const texture = await createHTMLTexture(this.gl, this.htmlContent, this.width, this.height);

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
        
        varying vec2 vUv;
        uniform sampler2D tMap;
        
        void main() {
          vec4 tex = texture2D(tMap, vUv);
          gl_FragColor = tex;
        }
      `,
      uniforms: {
        tMap: { value: texture }
      },
      transparent: true
    });

    this.mesh = new Mesh(this.gl, { geometry, program: this.program });
    this.mesh.setParent(this.scene);
  }

  setPosition(x: number, y: number, z: number) {
    if (this.mesh) {
      this.mesh.position.set(x, y, z);
    }
  }
}

interface CircularGalleryProps {
  items?: { htmlContent: string }[];
  width?: number;
  height?: number;
}

export default function CircularGallery({
  items = [
    { htmlContent: '<div style="background: #8B5CF6; color: white; padding: 20px; border-radius: 8px;">Conteúdo HTML</div>' },
    { htmlContent: '<div style="background: #10B981; color: white; padding: 20px; border-radius: 8px;">Outro Item</div>' }
  ],
  width = 512,
  height = 512
}: CircularGalleryProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const renderer = new Renderer({
      canvas: canvasRef.current,
      width: canvasRef.current.clientWidth,
      height: canvasRef.current.clientHeight,
      dpr: window.devicePixelRatio
    });

    const gl = renderer.gl;
    const scene = new Transform();
    const camera = new Camera(gl);
    camera.position.z = 5;

    // Criar instâncias e esperar todas estarem prontas
    const mediaPromises = items.map((item, i) => {
      const media = new Media({
        gl,
        scene,
        htmlContent: item.htmlContent,
        width,
        height
      });
      
      return media.ready.then(() => {
        const angle = (i / items.length) * Math.PI * 2;
        media.setPosition(Math.cos(angle) * 2, Math.sin(angle) * 2, 0);
        return media;
      });
    });

    let animationId: number;
    let mediaInstances: Media[] = [];

    Promise.all(mediaPromises).then((instances) => {
      mediaInstances = instances;

      function update() {
        requestAnimationFrame(update);
        renderer.render({ scene, camera });
      }

      update();
    });

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      mediaInstances.forEach(media => {
        if (media.mesh) {
          media.mesh.setParent(null);
        }
      });
    };
  }, [items, width, height]);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ width: '100%', height: '500px' }}
    />
  );
}