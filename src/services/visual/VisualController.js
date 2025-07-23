import canvasRenderer from './CanvasRenderer';

/**
 * VisualController
 * Integrates the CanvasRenderer with the StoryManager for LLM-directed visuals
 * Interprets LLM visual descriptions and translates them to rendering commands
 */
class VisualController {
  constructor() {
    this.renderer = canvasRenderer;
    this.initialized = false;
    this.currentScene = null;
    this.currentCharacters = new Map();
    
    // Map of mood keywords to visual parameters
    this.moodVisualMap = {
      '긴장감': {
        background: {
          type: 'gradient',
          colors: ['#1a1a1a', '#000000']
        },
        effects: ['vignette', 'grain'],
        vignette: { intensity: 0.7 },
        grain: { intensity: 0.2 }
      },
      '신비로움': {
        background: {
          type: 'gradient',
          colors: ['#1a0033', '#000033']
        },
        effects: ['particles', 'vignette'],
        vignette: { intensity: 0.5 },
        particles: { color: 'rgba(100, 100, 255, 0.5)', count: 30 }
      },
      '우울함': {
        background: {
          type: 'gradient',
          colors: ['#1a1a2e', '#0a0a1e']
        },
        effects: ['rain', 'vignette'],
        vignette: { intensity: 0.6 }
      },
      '평온함': {
        background: {
          type: 'gradient',
          colors: ['#0a1a2e', '#1a2a3e']
        },
        effects: ['vignette'],
        vignette: { intensity: 0.3 }
      },
      '흥분': {
        background: {
          type: 'gradient',
          colors: ['#330000', '#1a0000']
        },
        effects: ['shake', 'vignette'],
        vignette: { intensity: 0.5 },
        shake: { intensity: 3, duration: 30 }
      },
      'neutral': {
        background: {
          type: 'gradient',
          colors: ['#1a1a1a', '#0a0a0a']
        },
        effects: ['vignette'],
        vignette: { intensity: 0.4 }
      }
    };
    
    // Map of scene keywords to visual effects
    this.sceneToEffectMap = {
      '비': 'rain',
      '눈': 'snow',
      '안개': 'fog',
      '흔들': 'shake',
      '폭발': 'shake',
      '지진': 'shake'
    };
    
    // Base paths for image assets
    this.imagePaths = {
      backgrounds: 'assets/images/backgrounds/',
      characters: 'assets/images/characters/',
    };
    
    // Character type mapping
    this.characterTypeMap = {
      '남자': 'adult-male',
      '여자': 'adult-female',
      '아이': 'child',
      '노인': 'elderly',
      '소년': 'child',
      '소녀': 'child',
      '할아버지': 'elderly',
      '할머니': 'elderly'
    };
  }
  
  /**
   * Initialize the visual controller
   * @param {HTMLCanvasElement} canvas - The canvas element to render to
   * @param {number} width - Canvas width
   * @param {number} height - Canvas height
   */
  initialize(canvas, width, height) {
    if (this.initialized) return;
    
    // Initialize the canvas renderer
    this.renderer.initialize(canvas, width, height);
    this.initialized = true;
    console.log('Visual controller initialized');
  }
  
  /**
   * Process LLM-generated visual description
   * @param {object} visualDescription - The visual description from LLM
   * @param {string} sceneText - The scene text for context
   */
  processVisualDescription(visualDescription, sceneText) {
    if (!this.initialized) {
      console.error('Visual controller not initialized');
      return;
    }
    
    try {
      // Extract mood from scene text
      const mood = this.extractMoodFromText(sceneText);
      
      // Apply mood-based visual effects
      this.applyMoodVisuals(mood);
      
      // Parse the visual description
      const parsedDescription = this.parseVisualDescription(visualDescription);
      
      // Apply background based on description
      this.applyBackground(parsedDescription.background);
      
      // Update character positions and states
      this.updateCharacters(parsedDescription.characters, sceneText);
      
      // Apply special effects based on description and scene text
      this.applyEffects(parsedDescription.effects, sceneText);
      
      // Store current scene
      this.currentScene = {
        mood,
        description: visualDescription,
        parsedDescription
      };
      
      console.log(`Applied visual settings for mood: ${mood}`);
    } catch (error) {
      console.error('Error processing visual description:', error);
    }
  }
  
  /**
   * Parse the visual description from LLM
   * @param {string} description - The raw visual description
   * @returns {object} - Parsed visual elements
   */
  parseVisualDescription(description) {
    // Default parsed structure
    const parsed = {
      background: {
        type: 'gradient',
        colors: ['#1a1a1a', '#0a0a0a']
      },
      characters: [],
      effects: [],
      lighting: 'normal',
      colorPalette: []
    };
    
    // If description is a string, parse it
    if (typeof description === 'string') {
      // Extract background information
      const bgMatch = description.match(/배경:([^\n]+)/);
      if (bgMatch) {
        const bgDesc = bgMatch[1].trim();
        
        // Check for color descriptions
        if (bgDesc.includes('어두운') || bgDesc.includes('검은')) {
          parsed.background.type = 'gradient';
          parsed.background.colors = ['#0a0a0a', '#000000'];
        } else if (bgDesc.includes('붉은') || bgDesc.includes('빨간')) {
          parsed.background.type = 'gradient';
          parsed.background.colors = ['#330000', '#1a0000'];
        } else if (bgDesc.includes('푸른') || bgDesc.includes('파란')) {
          parsed.background.type = 'gradient';
          parsed.background.colors = ['#00001a', '#000033'];
        }
        
        // Check for specific locations
        if (bgDesc.includes('산장') || bgDesc.includes('오두막')) {
          parsed.background.type = 'image';
          parsed.background.src = `${this.imagePaths.backgrounds}cabin.jpg`;
        } else if (bgDesc.includes('숲') || bgDesc.includes('나무')) {
          parsed.background.type = 'image';
          parsed.background.src = `${this.imagePaths.backgrounds}forest.jpg`;
        } else if (bgDesc.includes('방') || bgDesc.includes('실내')) {
          parsed.background.type = 'image';
          parsed.background.src = `${this.imagePaths.backgrounds}room.jpg`;
        }
      }
      
      // Extract character information
      const charMatch = description.match(/캐릭터 위치:([^\n]+)/);
      if (charMatch) {
        const charDesc = charMatch[1].trim();
        
        // Look for character descriptions
        const charRegex = /(남자|여자|아이|노인|소년|소녀|할아버지|할머니)[^,]*(?:왼쪽|오른쪽|중앙|앞|뒤)?/g;
        const charMatches = charDesc.match(charRegex);
        
        if (charMatches) {
          charMatches.forEach((match, index) => {
            // Determine character type
            let type = 'default';
            for (const [key, value] of Object.entries(this.characterTypeMap)) {
              if (match.includes(key)) {
                type = value;
                break;
              }
            }
            
            // Determine position
            let position = { x: 0.5, y: 0.5 };
            if (match.includes('왼쪽')) {
              position.x = 0.25;
            } else if (match.includes('오른쪽')) {
              position.x = 0.75;
            }
            
            if (match.includes('앞')) {
              position.y = 0.6;
            } else if (match.includes('뒤')) {
              position.y = 0.4;
            }
            
            // Add character to parsed description
            parsed.characters.push({
              id: `char_${index}`,
              type,
              position,
              speaking: false,
              scale: 1.0
            });
          });
        }
      }
      
      // Extract lighting information
      const lightMatch = description.match(/조명:([^\n]+)/);
      if (lightMatch) {
        const lightDesc = lightMatch[1].trim();
        
        if (lightDesc.includes('어두운') || lightDesc.includes('약한')) {
          parsed.lighting = 'dim';
        } else if (lightDesc.includes('밝은') || lightDesc.includes('강한')) {
          parsed.lighting = 'bright';
        } else if (lightDesc.includes('붉은') || lightDesc.includes('빨간')) {
          parsed.lighting = 'red';
        } else if (lightDesc.includes('푸른') || lightDesc.includes('파란')) {
          parsed.lighting = 'blue';
        }
      }
      
      // Extract special effects
      const effectMatch = description.match(/특수 효과:([^\n]+)/);
      if (effectMatch) {
        const effectDesc = effectMatch[1].trim();
        
        if (effectDesc.includes('비') || effectDesc.includes('빗방울')) {
          parsed.effects.push({ type: 'rain', intensity: 0.7 });
        }
        
        if (effectDesc.includes('안개') || effectDesc.includes('흐릿한')) {
          parsed.effects.push({ type: 'fog', intensity: 0.5 });
        }
        
        if (effectDesc.includes('눈') || effectDesc.includes('눈송이')) {
          parsed.effects.push({ type: 'snow', intensity: 0.6 });
        }
        
        if (effectDesc.includes('흔들') || effectDesc.includes('진동')) {
          parsed.effects.push({ type: 'shake', intensity: 5, duration: 60 });
        }
        
        if (effectDesc.includes('입자') || effectDesc.includes('먼지')) {
          parsed.effects.push({ 
            type: 'particles', 
            params: { 
              count: 50, 
              color: 'rgba(255, 255, 255, 0.3)',
              size: 2,
              speed: 0.5
            } 
          });
        }
      }
      
      // Extract color palette
      const colorMatch = description.match(/색상 팔레트:([^\n]+)/);
      if (colorMatch) {
        const colorDesc = colorMatch[1].trim();
        const colors = colorDesc.split(',').map(c => c.trim());
        
        // Convert color names to hex codes
        colors.forEach(color => {
          if (color.includes('검은') || color.includes('검정')) {
            parsed.colorPalette.push('#000000');
          } else if (color.includes('붉은') || color.includes('빨간')) {
            parsed.colorPalette.push('#990000');
          } else if (color.includes('푸른') || color.includes('파란')) {
            parsed.colorPalette.push('#000099');
          } else if (color.includes('회색') || color.includes('그레이')) {
            parsed.colorPalette.push('#666666');
          } else if (color.includes('보라') || color.includes('퍼플')) {
            parsed.colorPalette.push('#660066');
          } else {
            parsed.colorPalette.push('#333333'); // Default dark gray
          }
        });
      }
    } else if (typeof description === 'object') {
      // If description is already an object, use it directly
      return {
        ...parsed,
        ...description
      };
    }
    
    return parsed;
  }
  
  /**
   * Extract mood from text using keyword analysis
   * @param {string} text - The text to analyze
   * @returns {string} - The extracted mood
   */
  extractMoodFromText(text) {
    // List of mood keywords to look for
    const moodKeywords = {
      '긴장감': ['긴장', '불안', '초조', '위험', '공포', '두려움', '무서움', '놀람'],
      '신비로움': ['신비', '미스터리', '수수께끼', '의문', '이상한', '기묘한', '알 수 없는'],
      '우울함': ['우울', '슬픔', '절망', '어둠', '비통', '침울', '쓸쓸함', '외로움'],
      '평온함': ['평온', '고요', '조용', '평화', '안정', '차분', '편안함'],
      '흥분': ['흥분', '열정', '격렬', '격정', '격앙', '흥미', '놀라움', '기쁨'],
    };
    
    // Count occurrences of mood keywords
    const moodCounts = {};
    for (const [mood, keywords] of Object.entries(moodKeywords)) {
      moodCounts[mood] = 0;
      for (const keyword of keywords) {
        const regex = new RegExp(keyword, 'g');
        const matches = text.match(regex);
        if (matches) {
          moodCounts[mood] += matches.length;
        }
      }
    }
    
    // Find the mood with the highest count
    let dominantMood = 'neutral'; // Default mood
    let highestCount = 0;
    
    for (const [mood, count] of Object.entries(moodCounts)) {
      if (count > highestCount) {
        highestCount = count;
        dominantMood = mood;
      }
    }
    
    return dominantMood;
  }
  
  /**
   * Apply visual effects based on mood
   * @param {string} mood - The mood to apply
   */
  applyMoodVisuals(mood) {
    const moodSettings = this.moodVisualMap[mood] || this.moodVisualMap.neutral;
    
    // Apply background if no specific background is set
    if (!this.currentScene || !this.currentScene.parsedDescription.background.src) {
      this.renderer.setBackground(moodSettings.background);
    }
    
    // Apply effects
    if (moodSettings.effects) {
      // Clear existing effects
      this.renderer.currentEffects = [];
      
      // Apply new effects
      moodSettings.effects.forEach(effect => {
        switch (effect) {
          case 'vignette':
            this.renderer.setVignetteEffect(true, moodSettings.vignette?.intensity || 0.5);
            break;
          case 'grain':
            this.renderer.setGrainEffect(true, moodSettings.grain?.intensity || 0.1);
            break;
          case 'shake':
            this.renderer.setShakeEffect(
              true, 
              moodSettings.shake?.intensity || 5, 
              moodSettings.shake?.duration || 30
            );
            break;
          case 'particles':
            this.renderer.addEffect({
              type: 'particles',
              params: moodSettings.particles || {}
            });
            break;
          case 'rain':
            this.renderer.addEffect({
              type: 'rain',
              intensity: 0.7
            });
            break;
          case 'snow':
            this.renderer.addEffect({
              type: 'snow',
              intensity: 0.6
            });
            break;
          case 'fog':
            this.renderer.addEffect({
              type: 'fog',
              intensity: 0.5
            });
            break;
        }
      });
    }
  }
  
  /**
   * Apply background based on description
   * @param {object} background - Background configuration
   */
  applyBackground(background) {
    this.renderer.setBackground(background);
  }
  
  /**
   * Update characters based on description and scene text
   * @param {Array} characters - Character configurations
   * @param {string} sceneText - The scene text
   */
  updateCharacters(characters, sceneText) {
    // Create a set of current character IDs
    const currentCharIds = new Set(characters.map(char => char.id));
    
    // Remove characters that are no longer in the scene
    this.currentCharacters.forEach((char, id) => {
      if (!currentCharIds.has(id)) {
        this.renderer.removeCharacter(id);
        this.currentCharacters.delete(id);
      }
    });
    
    // Add or update characters
    characters.forEach(character => {
      if (this.currentCharacters.has(character.id)) {
        // Update existing character
        this.renderer.updateCharacter(character.id, character);
        this.currentCharacters.set(character.id, character);
      } else {
        // Add new character
        this.renderer.addCharacter(character);
        this.currentCharacters.set(character.id, character);
      }
    });
    
    // Determine which character is speaking based on scene text
    // This is a simple heuristic - in a real implementation, this would be more sophisticated
    if (characters.length > 0 && sceneText.includes('"') || sceneText.includes('"')) {
      // Find the last updated character and make them speak
      const lastCharId = [...this.currentCharacters.keys()].pop();
      if (lastCharId) {
        const updatedChar = { ...this.currentCharacters.get(lastCharId), speaking: true };
        this.renderer.updateCharacter(lastCharId, updatedChar);
        this.currentCharacters.set(lastCharId, updatedChar);
        
        // Make other characters not speaking
        this.currentCharacters.forEach((char, id) => {
          if (id !== lastCharId && char.speaking) {
            const updatedChar = { ...char, speaking: false };
            this.renderer.updateCharacter(id, updatedChar);
            this.currentCharacters.set(id, updatedChar);
          }
        });
      }
    }
  }
  
  /**
   * Apply special effects based on description and scene text
   * @param {Array} effects - Effect configurations
   * @param {string} sceneText - The scene text
   */
  applyEffects(effects, sceneText) {
    // Apply effects from description
    effects.forEach(effect => {
      this.renderer.addEffect(effect);
    });
    
    // Check for keywords in scene text
    for (const [keyword, effectType] of Object.entries(this.sceneToEffectMap)) {
      if (sceneText.includes(keyword)) {
        switch (effectType) {
          case 'rain':
            this.renderer.addEffect({ type: 'rain', intensity: 0.7 });
            break;
          case 'snow':
            this.renderer.addEffect({ type: 'snow', intensity: 0.6 });
            break;
          case 'fog':
            this.renderer.addEffect({ type: 'fog', intensity: 0.5 });
            break;
          case 'shake':
            this.renderer.setShakeEffect(true, 5, 60);
            break;
        }
      }
    }
    
    // Apply lighting effects based on scene text
    if (sceneText.includes('어두운') || sceneText.includes('밤')) {
      this.renderer.setVignetteEffect(true, 0.7);
    } else if (sceneText.includes('밝은') || sceneText.includes('낮')) {
      this.renderer.setVignetteEffect(true, 0.3);
    }
  }
  
  /**
   * Clear the scene
   */
  clearScene() {
    this.renderer.clearScene();
    this.currentCharacters.clear();
    this.currentScene = null;
  }
  
  /**
   * Resize the canvas
   * @param {number} width - New width
   * @param {number} height - New height
   */
  resize(width, height) {
    this.renderer.resize(width, height);
  }
}

// Create and export a singleton instance
const visualController = new VisualController();
export default visualController;