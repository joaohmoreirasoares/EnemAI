// ... (keep all previous imports and types)

class GalleryItem {
  // ... (keep existing constructor and methods)

  destroy() {
    // Proper cleanup method for GalleryItem
    if (this.texture) {
      this.texture.destroy();
    }
    this.program.destroy();
    this.mesh.setParent(null);
    
    // OGL geometries don't have dispose() method, so we don't call it
    // Instead, we remove references to allow garbage collection
  }
}

// ... (keep CircularGalleryProps interface)

export default function CircularGallery({
  // ... (keep existing props)
}: CircularGalleryProps) {
  // ... (keep existing refs and state)

  useEffect(() => {
    // ... (keep initialization code)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      
      // Proper cleanup using destroy method
      itemsRef.current.forEach(item => {
        item.destroy();
      });
      
      // Additional WebGL context cleanup
      const gl = renderer.gl;
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [items, radius, width, height]);

  // ... (keep return statement)
}