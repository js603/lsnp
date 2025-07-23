/**
 * CanvasRenderer
 * Handles HTML Canvas rendering for the game
 * Provides methods for drawing backgrounds, characters, and effects
 */
class CanvasRenderer {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.width = 0;
    this.height = 0;
    this.initialized = false;
    
    // Rendering layers
    this.layers = {
      background: null,
      characters: null,
      effects: null,
      overlay: null
    };
    
    // Animation frame ID for cancellation
    this.animationFrameId = null;
    
    // Current scene elements
    this.currentBackground = null;
    this.currentCharacters = [];
    this.currentEffects = [];
    
    // Effect parameters
    this.effectParams = {
      vignette: {
        enabled: false,
        intensity: 0.5,
        color: 'rgba(0, 0, 0, 0.7)'
      },
      blur: {
        enabled: false,
        intensity: 0
      },
      grain: {
        enabled: false,
        intensity: 0.1
      },
      shake: {
        enabled: false,
        intensity: 5,
        duration: 0
      }
    };
  }
  
  /**
   * Initialize the canvas renderer
   * @param {HTMLCanvasElement} canvas - The canvas element to render to
   * @param {number} width - Canvas width
   * @param {number} height - Canvas height
   */
  initialize(canvas, width, height) {
    if (this.initialized) return;
    
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = width || canvas.width;
    this.height = height || canvas.height;
    
    // Set canvas dimensions
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    
    // Create layer canvases for compositing
    for (const layer in this.layers) {
      const layerCanvas = document.createElement('canvas');
      layerCanvas.width = this.width;
      layerCanvas.height = this.height;
      this.layers[layer] = {
        canvas: layerCanvas,
        ctx: layerCanvas.getContext('2d')
      };
    }
    
    this.initialized = true;
    console.log('Canvas renderer initialized');
    
    // Start render loop
    this.startRenderLoop();
  }
  
  /**
   * Start the render loop
   */
  startRenderLoop() {
    const render = () => {
      this.render();
      this.animationFrameId = requestAnimationFrame(render);
    };
    
    this.animationFrameId = requestAnimationFrame(render);
  }
  
  /**
   * Stop the render loop
   */
  stopRenderLoop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
  
  /**
   * Render the current scene
   */
  render() {
    if (!this.initialized) return;
    
    // Clear main canvas
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // Clear all layer canvases
    for (const layer in this.layers) {
      this.layers[layer].ctx.clearRect(0, 0, this.width, this.height);
    }
    
    // Render background layer
    this.renderBackground();
    
    // Render character layer
    this.renderCharacters();
    
    // Render effects layer
    this.renderEffects();
    
    // Render overlay layer
    this.renderOverlay();
    
    // Composite all layers onto main canvas
    for (const layer in this.layers) {
      this.ctx.drawImage(this.layers[layer].canvas, 0, 0);
    }
  }
  
  /**
   * Render the background layer
   */
  renderBackground() {
    const ctx = this.layers.background.ctx;
    
    if (this.currentBackground) {
      if (this.currentBackground.type === 'image' && this.currentBackground.image) {
        // Draw background image
        ctx.drawImage(
          this.currentBackground.image,
          0, 0,
          this.width, this.height
        );
      } else if (this.currentBackground.type === 'color') {
        // Fill with solid color
        ctx.fillStyle = this.currentBackground.color || '#000';
        ctx.fillRect(0, 0, this.width, this.height);
      } else if (this.currentBackground.type === 'gradient') {
        // Create gradient
        const gradient = ctx.createLinearGradient(
          0, 0,
          0, this.height
        );
        
        // Add color stops
        const colors = this.currentBackground.colors || ['#000', '#333'];
        colors.forEach((color, index) => {
          gradient.addColorStop(index / (colors.length - 1), color);
        });
        
        // Fill with gradient
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, this.height);
      }
      
      // Apply background effects
      if (this.currentBackground.effects) {
        if (this.currentBackground.effects.brightness !== undefined) {
          ctx.filter = `brightness(${this.currentBackground.effects.brightness}%)`;
        }
      }
    } else {
      // Default black background
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, this.width, this.height);
    }
  }
  
  /**
   * Render character silhouettes
   */
  renderCharacters() {
    const ctx = this.layers.characters.ctx;
    
    this.currentCharacters.forEach(character => {
      if (!character.visible) return;
      
      // Calculate position
      const x = this.width * (character.position.x || 0.5);
      const y = this.height * (character.position.y || 0.5);
      const scale = character.scale || 1;
      
      // Save context state
      ctx.save();
      
      // Apply transformations
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      
      // Apply rotation if specified
      if (character.rotation) {
        ctx.rotate(character.rotation * Math.PI / 180);
      }
      
      // Set silhouette style
      ctx.fillStyle = character.color || '#000';
      
      // Draw character silhouette
      if (character.type === 'custom' && character.path) {
        // Draw custom path
        const path = new Path2D(character.path);
        ctx.fill(path);
      } else {
        // Draw default silhouette based on character type
        this.drawCharacterSilhouette(ctx, character.type || 'default');
      }
      
      // Apply speaking animation if character is speaking
      if (character.speaking) {
        const speakingTime = Date.now() * 0.005;
        const speakingScale = 1 + Math.sin(speakingTime) * 0.02;
        ctx.scale(speakingScale, speakingScale);
      }
      
      // Restore context state
      ctx.restore();
    });
  }
  
  /**
   * Draw a character silhouette based on type
   * @param {CanvasRenderingContext2D} ctx - The canvas context
   * @param {string} type - The character type
   */
  drawCharacterSilhouette(ctx, type) {
    // Default offset to center the silhouette
    const offsetX = -50;
    const offsetY = -100;
    
    switch (type) {
      case 'adult-male':
        // Head
        ctx.beginPath();
        ctx.arc(offsetX + 50, offsetY + 30, 20, 0, Math.PI * 2);
        ctx.fill();
        
        // Body
        ctx.beginPath();
        ctx.moveTo(offsetX + 40, offsetY + 50);
        ctx.lineTo(offsetX + 60, offsetY + 50);
        ctx.lineTo(offsetX + 65, offsetY + 120);
        ctx.lineTo(offsetX + 35, offsetY + 120);
        ctx.closePath();
        ctx.fill();
        
        // Arms
        ctx.beginPath();
        ctx.moveTo(offsetX + 40, offsetY + 55);
        ctx.lineTo(offsetX + 25, offsetY + 90);
        ctx.lineTo(offsetX + 35, offsetY + 95);
        ctx.lineTo(offsetX + 45, offsetY + 65);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(offsetX + 60, offsetY + 55);
        ctx.lineTo(offsetX + 75, offsetY + 90);
        ctx.lineTo(offsetX + 65, offsetY + 95);
        ctx.lineTo(offsetX + 55, offsetY + 65);
        ctx.closePath();
        ctx.fill();
        
        // Legs
        ctx.beginPath();
        ctx.moveTo(offsetX + 35, offsetY + 120);
        ctx.lineTo(offsetX + 30, offsetY + 180);
        ctx.lineTo(offsetX + 40, offsetY + 180);
        ctx.lineTo(offsetX + 45, offsetY + 120);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(offsetX + 55, offsetY + 120);
        ctx.lineTo(offsetX + 60, offsetY + 180);
        ctx.lineTo(offsetX + 70, offsetY + 180);
        ctx.lineTo(offsetX + 65, offsetY + 120);
        ctx.closePath();
        ctx.fill();
        break;
        
      case 'adult-female':
        // Head
        ctx.beginPath();
        ctx.arc(offsetX + 50, offsetY + 30, 18, 0, Math.PI * 2);
        ctx.fill();
        
        // Body
        ctx.beginPath();
        ctx.moveTo(offsetX + 40, offsetY + 50);
        ctx.lineTo(offsetX + 60, offsetY + 50);
        ctx.lineTo(offsetX + 70, offsetY + 120);
        ctx.lineTo(offsetX + 30, offsetY + 120);
        ctx.closePath();
        ctx.fill();
        
        // Arms
        ctx.beginPath();
        ctx.moveTo(offsetX + 40, offsetY + 55);
        ctx.lineTo(offsetX + 25, offsetY + 85);
        ctx.lineTo(offsetX + 35, offsetY + 90);
        ctx.lineTo(offsetX + 45, offsetY + 65);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(offsetX + 60, offsetY + 55);
        ctx.lineTo(offsetX + 75, offsetY + 85);
        ctx.lineTo(offsetX + 65, offsetY + 90);
        ctx.lineTo(offsetX + 55, offsetY + 65);
        ctx.closePath();
        ctx.fill();
        
        // Legs
        ctx.beginPath();
        ctx.moveTo(offsetX + 30, offsetY + 120);
        ctx.lineTo(offsetX + 25, offsetY + 180);
        ctx.lineTo(offsetX + 35, offsetY + 180);
        ctx.lineTo(offsetX + 45, offsetY + 120);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(offsetX + 55, offsetY + 120);
        ctx.lineTo(offsetX + 65, offsetY + 180);
        ctx.lineTo(offsetX + 75, offsetY + 180);
        ctx.lineTo(offsetX + 70, offsetY + 120);
        ctx.closePath();
        ctx.fill();
        break;
        
      case 'child':
        // Head (larger relative to body)
        ctx.beginPath();
        ctx.arc(offsetX + 50, offsetY + 30, 22, 0, Math.PI * 2);
        ctx.fill();
        
        // Body (smaller)
        ctx.beginPath();
        ctx.moveTo(offsetX + 42, offsetY + 52);
        ctx.lineTo(offsetX + 58, offsetY + 52);
        ctx.lineTo(offsetX + 60, offsetY + 100);
        ctx.lineTo(offsetX + 40, offsetY + 100);
        ctx.closePath();
        ctx.fill();
        
        // Arms
        ctx.beginPath();
        ctx.moveTo(offsetX + 42, offsetY + 55);
        ctx.lineTo(offsetX + 30, offsetY + 80);
        ctx.lineTo(offsetX + 38, offsetY + 85);
        ctx.lineTo(offsetX + 45, offsetY + 65);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(offsetX + 58, offsetY + 55);
        ctx.lineTo(offsetX + 70, offsetY + 80);
        ctx.lineTo(offsetX + 62, offsetY + 85);
        ctx.lineTo(offsetX + 55, offsetY + 65);
        ctx.closePath();
        ctx.fill();
        
        // Legs
        ctx.beginPath();
        ctx.moveTo(offsetX + 40, offsetY + 100);
        ctx.lineTo(offsetX + 35, offsetY + 150);
        ctx.lineTo(offsetX + 45, offsetY + 150);
        ctx.lineTo(offsetX + 48, offsetY + 100);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(offsetX + 52, offsetY + 100);
        ctx.lineTo(offsetX + 55, offsetY + 150);
        ctx.lineTo(offsetX + 65, offsetY + 150);
        ctx.lineTo(offsetX + 60, offsetY + 100);
        ctx.closePath();
        ctx.fill();
        break;
        
      case 'elderly':
        // Head
        ctx.beginPath();
        ctx.arc(offsetX + 50, offsetY + 30, 20, 0, Math.PI * 2);
        ctx.fill();
        
        // Body (slightly hunched)
        ctx.beginPath();
        ctx.moveTo(offsetX + 40, offsetY + 50);
        ctx.lineTo(offsetX + 60, offsetY + 50);
        ctx.lineTo(offsetX + 65, offsetY + 70);
        ctx.lineTo(offsetX + 60, offsetY + 120);
        ctx.lineTo(offsetX + 40, offsetY + 120);
        ctx.lineTo(offsetX + 35, offsetY + 70);
        ctx.closePath();
        ctx.fill();
        
        // Arms
        ctx.beginPath();
        ctx.moveTo(offsetX + 40, offsetY + 55);
        ctx.lineTo(offsetX + 25, offsetY + 90);
        ctx.lineTo(offsetX + 35, offsetY + 95);
        ctx.lineTo(offsetX + 45, offsetY + 65);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(offsetX + 60, offsetY + 55);
        ctx.lineTo(offsetX + 75, offsetY + 90);
        ctx.lineTo(offsetX + 65, offsetY + 95);
        ctx.lineTo(offsetX + 55, offsetY + 65);
        ctx.closePath();
        ctx.fill();
        
        // Legs
        ctx.beginPath();
        ctx.moveTo(offsetX + 40, offsetY + 120);
        ctx.lineTo(offsetX + 35, offsetY + 180);
        ctx.lineTo(offsetX + 45, offsetY + 180);
        ctx.lineTo(offsetX + 48, offsetY + 120);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(offsetX + 52, offsetY + 120);
        ctx.lineTo(offsetX + 55, offsetY + 180);
        ctx.lineTo(offsetX + 65, offsetY + 180);
        ctx.lineTo(offsetX + 60, offsetY + 120);
        ctx.closePath();
        ctx.fill();
        
        // Cane
        ctx.beginPath();
        ctx.moveTo(offsetX + 25, offsetY + 90);
        ctx.lineTo(offsetX + 20, offsetY + 180);
        ctx.lineTo(offsetX + 25, offsetY + 180);
        ctx.lineTo(offsetX + 30, offsetY + 90);
        ctx.closePath();
        ctx.fill();
        break;
        
      default:
        // Default silhouette (simple human shape)
        ctx.beginPath();
        ctx.arc(offsetX + 50, offsetY + 30, 20, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(offsetX + 40, offsetY + 50);
        ctx.lineTo(offsetX + 60, offsetY + 50);
        ctx.lineTo(offsetX + 65, offsetY + 120);
        ctx.lineTo(offsetX + 35, offsetY + 120);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(offsetX + 40, offsetY + 55);
        ctx.lineTo(offsetX + 20, offsetY + 90);
        ctx.lineTo(offsetX + 30, offsetY + 95);
        ctx.lineTo(offsetX + 45, offsetY + 65);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(offsetX + 60, offsetY + 55);
        ctx.lineTo(offsetX + 80, offsetY + 90);
        ctx.lineTo(offsetX + 70, offsetY + 95);
        ctx.lineTo(offsetX + 55, offsetY + 65);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(offsetX + 35, offsetY + 120);
        ctx.lineTo(offsetX + 30, offsetY + 180);
        ctx.lineTo(offsetX + 40, offsetY + 180);
        ctx.lineTo(offsetX + 45, offsetY + 120);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(offsetX + 55, offsetY + 120);
        ctx.lineTo(offsetX + 60, offsetY + 180);
        ctx.lineTo(offsetX + 70, offsetY + 180);
        ctx.lineTo(offsetX + 65, offsetY + 120);
        ctx.closePath();
        ctx.fill();
        break;
    }
  }
  
  /**
   * Render visual effects
   */
  renderEffects() {
    const ctx = this.layers.effects.ctx;
    
    // Apply current effects
    this.currentEffects.forEach(effect => {
      switch (effect.type) {
        case 'rain':
          this.renderRainEffect(ctx, effect.intensity || 1);
          break;
        case 'snow':
          this.renderSnowEffect(ctx, effect.intensity || 1);
          break;
        case 'fog':
          this.renderFogEffect(ctx, effect.intensity || 0.5);
          break;
        case 'particles':
          this.renderParticleEffect(ctx, effect.params || {});
          break;
      }
    });
  }
  
  /**
   * Render overlay effects (vignette, grain, etc.)
   */
  renderOverlay() {
    const ctx = this.layers.overlay.ctx;
    
    // Vignette effect
    if (this.effectParams.vignette.enabled) {
      const intensity = this.effectParams.vignette.intensity;
      const gradient = ctx.createRadialGradient(
        this.width / 2, this.height / 2, this.height * 0.25,
        this.width / 2, this.height / 2, this.height * 0.75
      );
      
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(1, this.effectParams.vignette.color);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, this.width, this.height);
    }
    
    // Grain effect
    if (this.effectParams.grain.enabled) {
      const intensity = this.effectParams.grain.intensity;
      const imageData = ctx.getImageData(0, 0, this.width, this.height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * intensity * 255;
        data[i] += noise;
        data[i + 1] += noise;
        data[i + 2] += noise;
      }
      
      ctx.putImageData(imageData, 0, 0);
    }
    
    // Shake effect
    if (this.effectParams.shake.enabled) {
      const intensity = this.effectParams.shake.intensity;
      const offsetX = (Math.random() - 0.5) * intensity;
      const offsetY = (Math.random() - 0.5) * intensity;
      
      ctx.translate(offsetX, offsetY);
      
      // Decrement duration if set
      if (this.effectParams.shake.duration > 0) {
        this.effectParams.shake.duration -= 1;
        if (this.effectParams.shake.duration <= 0) {
          this.effectParams.shake.enabled = false;
        }
      }
    }
  }
  
  /**
   * Render rain effect
   * @param {CanvasRenderingContext2D} ctx - The canvas context
   * @param {number} intensity - Rain intensity (0-1)
   */
  renderRainEffect(ctx, intensity) {
    const dropCount = Math.floor(100 * intensity);
    const time = Date.now() * 0.1;
    
    ctx.strokeStyle = 'rgba(200, 200, 255, 0.8)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < dropCount; i++) {
      const x = (Math.sin(i * 0.1 + time * 0.01) * 0.5 + 0.5) * this.width;
      const y = ((time + i * 10) % this.height);
      const length = 10 + Math.random() * 20;
      
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 5, y + length);
      ctx.stroke();
    }
  }
  
  /**
   * Render snow effect
   * @param {CanvasRenderingContext2D} ctx - The canvas context
   * @param {number} intensity - Snow intensity (0-1)
   */
  renderSnowEffect(ctx, intensity) {
    const flakeCount = Math.floor(50 * intensity);
    const time = Date.now() * 0.05;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    
    for (let i = 0; i < flakeCount; i++) {
      const x = (Math.sin(i * 0.1 + time * 0.01) * 0.5 + 0.5) * this.width;
      const y = ((time + i * 20) % this.height);
      const size = 1 + Math.random() * 3;
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  /**
   * Render fog effect
   * @param {CanvasRenderingContext2D} ctx - The canvas context
   * @param {number} intensity - Fog intensity (0-1)
   */
  renderFogEffect(ctx, intensity) {
    ctx.fillStyle = `rgba(200, 200, 200, ${intensity * 0.5})`;
    ctx.fillRect(0, 0, this.width, this.height);
    
    // Add some fog "puffs"
    const puffCount = Math.floor(10 * intensity);
    const time = Date.now() * 0.001;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    
    for (let i = 0; i < puffCount; i++) {
      const x = ((time * 10 + i * 100) % this.width);
      const y = (Math.sin(i * 0.5 + time) * 0.2 + 0.5) * this.height;
      const size = 50 + Math.random() * 100;
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  /**
   * Render particle effect
   * @param {CanvasRenderingContext2D} ctx - The canvas context
   * @param {object} params - Particle parameters
   */
  renderParticleEffect(ctx, params) {
    const count = params.count || 50;
    const color = params.color || 'rgba(255, 255, 255, 0.8)';
    const size = params.size || 3;
    const speed = params.speed || 1;
    const time = Date.now() * 0.001 * speed;
    
    ctx.fillStyle = color;
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const distance = 50 + Math.sin(time + i * 0.1) * 30;
      const x = this.width / 2 + Math.cos(angle + time) * distance;
      const y = this.height / 2 + Math.sin(angle + time) * distance;
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  /**
   * Set the background
   * @param {object} background - Background configuration
   */
  setBackground(background) {
    if (background.type === 'image' && background.src) {
      // Load image if src is provided
      const image = new Image();
      image.onload = () => {
        this.currentBackground = {
          ...background,
          image
        };
      };
      image.src = background.src;
    } else {
      this.currentBackground = background;
    }
  }
  
  /**
   * Add a character to the scene
   * @param {object} character - Character configuration
   */
  addCharacter(character) {
    this.currentCharacters.push({
      ...character,
      visible: true
    });
  }
  
  /**
   * Update a character in the scene
   * @param {string} id - Character ID
   * @param {object} updates - Properties to update
   */
  updateCharacter(id, updates) {
    const index = this.currentCharacters.findIndex(char => char.id === id);
    if (index !== -1) {
      this.currentCharacters[index] = {
        ...this.currentCharacters[index],
        ...updates
      };
    }
  }
  
  /**
   * Remove a character from the scene
   * @param {string} id - Character ID
   */
  removeCharacter(id) {
    this.currentCharacters = this.currentCharacters.filter(char => char.id !== id);
  }
  
  /**
   * Add a visual effect
   * @param {object} effect - Effect configuration
   */
  addEffect(effect) {
    this.currentEffects.push(effect);
  }
  
  /**
   * Remove a visual effect
   * @param {string} type - Effect type
   */
  removeEffect(type) {
    this.currentEffects = this.currentEffects.filter(effect => effect.type !== type);
  }
  
  /**
   * Enable/disable vignette effect
   * @param {boolean} enabled - Whether the effect is enabled
   * @param {number} intensity - Effect intensity (0-1)
   */
  setVignetteEffect(enabled, intensity = 0.5) {
    this.effectParams.vignette.enabled = enabled;
    if (intensity !== undefined) {
      this.effectParams.vignette.intensity = Math.max(0, Math.min(1, intensity));
    }
  }
  
  /**
   * Enable/disable grain effect
   * @param {boolean} enabled - Whether the effect is enabled
   * @param {number} intensity - Effect intensity (0-1)
   */
  setGrainEffect(enabled, intensity = 0.1) {
    this.effectParams.grain.enabled = enabled;
    if (intensity !== undefined) {
      this.effectParams.grain.intensity = Math.max(0, Math.min(1, intensity));
    }
  }
  
  /**
   * Enable/disable shake effect
   * @param {boolean} enabled - Whether the effect is enabled
   * @param {number} intensity - Effect intensity
   * @param {number} duration - Effect duration in frames (0 for infinite)
   */
  setShakeEffect(enabled, intensity = 5, duration = 0) {
    this.effectParams.shake.enabled = enabled;
    if (intensity !== undefined) {
      this.effectParams.shake.intensity = intensity;
    }
    if (duration !== undefined) {
      this.effectParams.shake.duration = duration;
    }
  }
  
  /**
   * Clear the scene
   */
  clearScene() {
    this.currentBackground = null;
    this.currentCharacters = [];
    this.currentEffects = [];
    
    // Reset effects
    this.effectParams.vignette.enabled = false;
    this.effectParams.grain.enabled = false;
    this.effectParams.shake.enabled = false;
  }
  
  /**
   * Resize the canvas
   * @param {number} width - New width
   * @param {number} height - New height
   */
  resize(width, height) {
    this.width = width;
    this.height = height;
    
    // Resize main canvas
    this.canvas.width = width;
    this.canvas.height = height;
    
    // Resize layer canvases
    for (const layer in this.layers) {
      this.layers[layer].canvas.width = width;
      this.layers[layer].canvas.height = height;
    }
  }
}

// Create and export a singleton instance
const canvasRenderer = new CanvasRenderer();
export default canvasRenderer;