import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } from 'ogl';
import { useEffect, useRef } from 'react';

type GL = WebGLRenderingContext | WebGL2RenderingContext;

async function createHTMLTexture(gl: GL, html: string, width: number, height: number): Promise<Texture> {
  return new Promise((resolve, reject) => {
    try {
      const svgStr = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
          <foreignObject width="100%" height="100%">
            <div xmlns="http://www.w3.org/1999/xhtml" style="
              width: ${width}px;
              height: ${height}px;
              font-family: system-ui, sans-serif;
              padding: 20px;
              box-sizing: border-box;
              background: rgba(255, 255, 255, 0.9);
              border-radius: 8px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            ">
              ${html}
            </div>
          </foreignObject>
        </svg>
      `;

      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('Could not get 2D context');
          
          ctx.drawImage(img, 0, 0);
          const texture = new Texture(gl, { 
            generateMipmaps: false,
            image: canvas
          });
          resolve(texture);
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = (err) => reject(new Error('Image loading failed'));
      img.src = 'data:image/svg+xml,' + encodeURIComponent(svgStr);
    } catch (error) {
      reject(error);
    }
  });
}

class GalleryItem {
  gl: GL;
  scene: Transform;
  mesh: Mesh;
  program: Program;
  texture: Texture | null = null;
  isReady = false;

  constructor({ gl, scene, html, width = 512, height = 512 }: {
    gl: GL;
    scene: Transform;
    html: string;
    width?: number;
    height?: number;
  }) {
    this.gl = gl;
    this.scene = scene;

    // Create placeholder texture
    const placeholderTexture = new Texture(gl);
    const placeholderCanvas = document.createElement('canvas');
    placeholderCanvas.width = width;
    placeholderCanvas.height = height;
    const ctx = placeholderCanvas.getContext('2d')!;
    ctx.fillStyle = '#6D28D9';
    ctx.fillRect(0, 0, width, height);
    placeholderTexture.image = placeholderCanvas;

    const geometry = new Plane(gl);
    const program = new Program(gl, {
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
      uniforms: { tMap: { value: placeholderTexture } },
      transparent: true
    });

    this.mesh = new Mesh(gl, { geometry, program });
    this.mesh.setParent(scene);
    this.program = program;

    // Load actual texture asynchronously
    this.loadTexture(html, width, height).catch(console.error);
  }

  async loadTexture(html: string, width: number, height: number) {
    try {
      this.texture = await createHTMLTexture(this.gl, html, width, height);
      this.program.uniforms.tMap.value = this.texture;
      this.program.needsUpdate = true;
      this.isReady = true;
    } catch (error) {
      console.error('Failed to load texture:', error);
      this.isReady = false;
    }
  }

  setPosition(x: number, y: number, z: number) {
    this.mesh.position.set(x, y, z);
  }

  setRotation(angle: number) {
    this.mesh.rotation.z = angle;
  }
}

interface CircularGalleryProps {
  items?: Array<{ html: string }>;
  radius?: number;
  width?: number;
  height?: number;
}

export default function CircularGallery({
  items = [
    { html: '<div style="color: #333; font-size: 24px; text-align: center;">Item 1</div>' },
    { html: '<div style="color: #333; font-size: 24px; text-align: center;">Item 2</div>' },
    { html: '<div style="color: #333; font-size: 24px; text-align: center;">Item 3</div>' }
  ],
  radius = 3,
  width = 512,
  height = 512
}: CircularGalleryProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const itemsRef = useRef<GalleryItem[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize renderer
    const renderer = new Renderer({
      canvas: canvasRef.current,
      width: canvasRef.current.clientWidth,
      height: canvasRef.current.clientHeight,
      dpr: Math.min(window.devicePixelRatio, 2)
    });

    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);

    // Create scene graph
    const scene = new Transform();
    const camera = new Camera(gl);
    camera.position.z = 5;
    camera.fov = 45;

    // Create gallery items
    itemsRef.current = items.map((item, i) => {
      const angle = (i / items.length) * Math.PI * 2;
      const galleryItem = new GalleryItem({
        gl,
        scene,
        html: item.html,
        width,
        height
      });

      galleryItem.setPosition(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        0
      );

      return galleryItem;
    });

    // Handle resize
    const handleResize = () => {
      if (!canvasRef.current) return;
      renderer.setSize(
        canvasRef.current.clientWidth,
        canvasRef.current.clientHeight
      );
      camera.perspective({
        aspect: canvasRef.current.clientWidth / canvasRef.current.clientHeight
      });
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);

      // Only render if all items are ready
      if (itemsRef.current.every(item => item.isReady)) {
        // Rotate items
        itemsRef.current.forEach((item, i) => {
          const time = performance.now() * 0.001;
          const baseAngle = (i / itemsRef.current.length) * Math.PI * 2;
          item.setPosition(
            Math.cos(baseAngle + time * 0.2) * radius,
            Math.sin(baseAngle + time * 0.2) * radius,
            0
          );
          item.setRotation(-time * 0.5);
        });

        renderer.render({ scene, camera });
      }
    };
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      itemsRef.current.forEach(item => {
        item.mesh.setParent(null);
        item.mesh.geometry.dispose();
        item.program.dispose();
        if (item.texture) item.texture.destroy();
      });
    };
  }, [items, radius, width, height]);

  return (
    <canvas 
      ref={canvasRef} 
      style={{
        width: '100%',
        height: '500px',
        background: 'linear-gradient(45deg, #1a1a1a, #2d2d2d)'
      }}
    />
  );
}