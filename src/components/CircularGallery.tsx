class GalleryItem {
  gl: WebGLRenderingContext;
  scene: Transform;
  mesh: Mesh;
  program: Program;
  texture: Texture | null = null;
  isReady = false;

  // ... (keep constructor unchanged)

  destroy() {
    this.texture = null;
    this.program = null!;
    this.mesh.setParent(null);
  }
}