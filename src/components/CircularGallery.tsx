import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } from 'ogl';
import { useEffect, useRef } from 'react';

type GL = WebGLRenderingContext | WebGL2RenderingContext;

// ... (keep createHTMLTexture function unchanged)

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
    // ... (keep constructor implementation unchanged)
  }

  async loadTexture(html: string, width: number, height: number) {
    // ... (keep loadTexture implementation unchanged)
  }

  setPosition(x: number, y: number, z: number) {
    this.mesh.position.set(x, y, z);
  }

  setRotation(angle: number) {
    this.mesh.rotation.z = angle;
  }

  destroy() {
    if (this.texture) {
      this.texture.destroy();
    }
    this.program.destroy();
    this.mesh.setParent(null);
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

    const renderer = new Renderer({
      canvas: canvasRef.current,
      width: canvasRef.current.clientWidth,
      height: canvasRef.current.clientHeight,
      dpr: Math.min(window.devicePixelRatio, 2)
    });

    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);

    const scene = new Transform();
    const camera = new Camera(gl);
    camera.position.z = 5;
    camera.fov = 45;

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

    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);

      if (itemsRef.current.every(item => item.isReady)) {
        const time = performance.now() * 0.001;
        itemsRef.current.forEach((item, i) => {
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

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      
      itemsRef.current.forEach(item => {
        item.destroy();
      });

      const gl = renderer.gl;
      gl.getExtension('WEBGL_lose_context')?.loseContext();
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