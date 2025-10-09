class GalleryItem {
  // ... (other properties)

  destroy() {
    // Remove texture reference without calling destroy()
    this.texture = null;
    
    // Remove program reference
    this.program = null!;
    
    // Remove mesh from parent
    this.mesh.setParent(null);
  }
}