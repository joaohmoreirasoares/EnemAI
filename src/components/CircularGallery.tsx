import { 
  Camera, 
  Mesh, 
  Plane, 
  Program, 
  Renderer, 
  Texture, 
  Transform,
  type OGLRenderingContext
} from 'ogl';
import { useEffect, useRef } from 'react';

interface CircularGalleryProps {
  items?: Array<{
    html?: string;
  }>;
  radius?: number;
  width?: number;
  height?: number;
}

const vertexShader = `
  attribute vec2 uv;
  attribute vec3 position;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;
  uniform float uProgress;
  varying vec2 vUv;
  void main() {
    vec2 uv = vUv;
    vec3 color = vec3(0.0);
    color.r = uv.x;
    color.g = uv.y;
    color.b = 0.5 + 0.5 * sin(uProgress);
    gl_FragColor = vec4(color, 1.0);
  }
`;

class GalleryItem {
  gl: WebGLRenderingContext;
  scene: Transform;
  mesh: Mesh;
  program: Program;
  texture: Texture | null = null;
  isReady = false;

  constructor(gl: WebGLRenderingContext, scene: Transform) {
    this.gl = gl;
    this.scene = scene;
    
    // Create program
    this.program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        uProgress: { value: 0 }
      }
    });
    
    // Create geometry
    const geometry = new Plane(gl);
    
    // Create mesh
    this.mesh = new Mesh(gl, { geometry, program: this.program });
    this.mesh.setParent(scene);
  }

  destroy() {
    this.texture = null;
    this.program = null!;
    this.mesh.setParent(null);
  }
}

const CircularGallery = ({ 
  items = [], 
  radius = 2,
  width = 800,
  height = 600
}: CircularGalleryProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const sceneRef = useRef<Transform | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const galleryItemsRef = useRef<GalleryItem[]>([]);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize WebGL context
    const gl = canvasRef.current.getContext('webgl') as OGLRenderingContext;
    if (!gl) return;

    // Create renderer
    rendererRef.current = new Renderer({ 
      canvas: canvasRef.current,
      width,
      height,
      dpr: Math.min(window.devicePixelRatio, 2)
    });
    
    // Set canvas size
    rendererRef.current.setSize(width, height);
    
    // Create scene
    sceneRef.current = new Transform();
    
    // Create camera
    cameraRef.current = new Camera(gl, { fov: 45 });
    cameraRef.current.position.z = 5;
    
    // Create gallery items
    galleryItemsRef.current = items.map((_, i) => {
      const item = new GalleryItem(gl, sceneRef.current!);
      
      // Position items in a circle
      const angle = (i / items.length) * Math.PI * 2;
      item.mesh.position.x = Math.cos(angle) * radius;
      item.mesh.position.y = Math.sin(angle) * radius;
      
      return item;
    });
    
    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      
      // Rotate scene
      if (sceneRef.current) {
        sceneRef.current.rotation.y += 0.005;
      }
      
      // Update uniforms
      galleryItemsRef.current.forEach((item, i) => {
        if (item.program.uniforms.uProgress) {
          item.program.uniforms.uProgress.value = 
            (Math.sin(Date.now() * 0.001 + i) + 1) * 0.5;
        }
      });
      
      // Render
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render({ scene: sceneRef.current, camera: cameraRef.current });
      }
    };
    
    animate();
    
    // Cleanup
    return () => {
      cancelAnimationFrame(animationRef.current);
      
      galleryItemsRef.current.forEach(item => item.destroy());
      galleryItemsRef.current = [];
      
      sceneRef.current = null;
      cameraRef.current = null;
      rendererRef.current = null;
    };
  }, [items, radius, width, height]);

  return (
    <div className="relative w-full h-full">
      <canvas 
        ref={canvasRef} 
        width={width} 
        height={height}
        className="w-full h-full"
      />
    </div>
  );
};

export default CircularGallery;