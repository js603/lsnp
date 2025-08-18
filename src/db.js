import { doc, getDoc, setDoc, collection } from 'firebase/firestore';

// 데이터베이스 스키마 확인 및 초기화
export const checkAndInitializeDatabase = async (firestore, setLoading, setMessage, setInitialized) => {
  try {
    setLoading(true);
    setMessage('데이터베이스 스키마 확인 중...');

    const schemaDoc = await getDoc(doc(firestore, 'system', 'schema'));

    if (!schemaDoc.exists()) {
      setMessage('데이터베이스 스키마 초기화 중...');
      await initializeDatabase(firestore);
      setMessage('데이터베이스 스키마 초기화 완료!');
    } else {
      setMessage('데이터베이스 스키마 확인 완료!');
    }

    setInitialized(true);
    setLoading(false);
  } catch (error) {
    console.error('데이터베이스 초기화 오류:', error);
    setMessage('데이터베이스 초기화 오류: ' + error.message);
    setLoading(false);
  }
};

// 데이터베이스 스키마 초기화
const initializeDatabase = async (firestore) => {
    // 1. 스키마 버전 문서 생성
    await setDoc(doc(firestore, 'system', 'schema'), {
      version: '1.0.0',
      createdAt: new Date(),
      lastUpdated: new Date()
    });

    // 2. 기본 데이터 생성
    const regions = [
      {
        id: 'starter_village',
        name: '시작 마을',
        description: '모험가들이 첫 발걸음을 내딛는 평화로운 마을. 주변에는 낮은 레벨의 몬스터들이 서식하고 있다.',
        level: { min: 1, max: 10 },
        connectedRegions: ['forest_of_trials', 'goblin_camp'],
        monsters: ['wild_rabbit', 'wolf_pup', 'small_slime'],
        resources: ['copper_ore', 'herb_leaf', 'small_fish'],
        npcs: ['village_elder', 'weapon_merchant', 'quest_giver'],
        quests: ['first_steps', 'herb_collection', 'wolf_threat']
      },
      {
        id: 'forest_of_trials',
        name: '시험의 숲',
        description: '울창한 나무들 사이로 어렴풋이 위험이 느껴지는 숲. 초보 모험가들의 첫 시험장으로 알려져 있다.',
        level: { min: 5, max: 15 },
        connectedRegions: ['starter_village', 'dark_cave'],
        monsters: ['forest_wolf', 'goblin_scout', 'poison_spider'],
        resources: ['oak_wood', 'magic_mushroom', 'silver_ore'],
        npcs: ['forest_keeper', 'lost_traveler'],
        quests: ['mushroom_collection', 'spider_threat', 'lost_pendant']
      }
    ];
    for (const region of regions) {
      await setDoc(doc(firestore, 'regions', region.id), region);
    }

    const monsters = [
      {
        id: 'wild_rabbit',
        name: '야생 토끼',
        level: 1,
        hp: 10,
        mp: 0,
        attack: 1,
        defense: 0,
        exp: 5,
        drops: [
          { itemId: 'rabbit_meat', chance: 0.8, minQuantity: 1, maxQuantity: 2 },
          { itemId: 'rabbit_fur', chance: 0.5, minQuantity: 1, maxQuantity: 1 }
        ],
        description: '숲 속을 뛰어다니는 평범한 토끼. 위협적이지 않지만, 초보 모험가들에게는 좋은 사냥감이다.'
      },
      {
        id: 'wolf_pup',
        name: '늑대 새끼',
        level: 3,
        hp: 25,
        mp: 0,
        attack: 3,
        defense: 1,
        exp: 10,
        drops: [
          { itemId: 'wolf_fang', chance: 0.6, minQuantity: 1, maxQuantity: 1 },
          { itemId: 'wolf_pelt', chance: 0.4, minQuantity: 1, maxQuantity: 1 }
        ],
        description: '아직 어리지만 날카로운 이빨을 가진 늑대 새끼. 무리를 지어 다니므로 주의해야 한다.'
      },
      {
        id: 'small_slime',
        name: '작은 슬라임',
        level: 2,
        hp: 15,
        mp: 5,
        attack: 2,
        defense: 0,
        exp: 7,
        drops: [
          { itemId: 'slime_jelly', chance: 0.9, minQuantity: 1, maxQuantity: 3 }
        ],
        description: '끈적끈적한 젤리 같은 생명체. 약하지만 귀엽게 생겼다.'
      }
    ];
    for (const monster of monsters) {
      await setDoc(doc(firestore, 'monsters', monster.id), monster);
    }

    const items = [
      {
        id: 'rabbit_meat',
        name: '토끼 고기',
        type: 'material',
        subType: 'cooking',
        description: '신선한 토끼 고기. 요리에 사용하거나 상인에게 팔 수 있다.',
        value: 5,
        stackable: true,
        maxStack: 20
      },
      {
        id: 'rabbit_fur',
        name: '토끼 가죽',
        type: 'material',
        subType: 'leatherworking',
        description: '부드러운 토끼 가죽. 가죽 제작에 사용된다.',
        value: 8,
        stackable: true,
        maxStack: 20
      },
      {
        id: 'wolf_fang',
        name: '늑대 이빨',
        type: 'material',
        subType: 'crafting',
        description: '날카로운 늑대 이빨. 무기 제작에 사용될 수 있다.',
        value: 12,
        stackable: true,
        maxStack: 20
      },
      {
        id: 'slime_jelly',
        name: '슬라임 젤리',
        type: 'material',
        subType: 'alchemy',
        description: '끈적끈적한 슬라임 젤리. 연금술에 사용된다.',
        value: 7,
        stackable: true,
        maxStack: 20
      },
      {
        id: 'copper_ore',
        name: '구리 광석',
        type: 'material',
        subType: 'mining',
        description: '기본적인 금속 광석. 초보자용 장비를 만드는 데 사용된다.',
        value: 10,
        stackable: true,
        maxStack: 50
      },
      {
        id: 'small_health_potion',
        name: '소형 체력 물약',
        type: 'consumable',
        subType: 'potion',
        description: '체력을 20 회복시키는 물약.',
        value: 25,
        stackable: true,
        maxStack: 10,
        effect: { type: 'heal', amount: 20 }
      }
    ];
    for (const item of items) {
      await setDoc(doc(firestore, 'items', item.id), item);
    }

    const skills = [
      {
        id: 'basic_strike',
        name: '기본 타격',
        type: 'attack',
        description: '기본적인 무기 공격. 적에게 물리 데미지를 준다.',
        level: 1,
        mpCost: 0,
        cooldown: 0,
        damage: { min: 3, max: 5, type: 'physical' },
        targetType: 'single',
        requiredLevel: 1,
        requiredClass: null
      },
      {
        id: 'power_strike',
        name: '강력한 일격',
        type: 'attack',
        description: '강력한 무기 공격. 적에게 큰 물리 데미지를 준다.',
        level: 1,
        mpCost: 5,
        cooldown: 3,
        damage: { min: 7, max: 12, type: 'physical' },
        targetType: 'single',
        requiredLevel: 3,
        requiredClass: 'warrior'
      },
      {
        id: 'fireball',
        name: '화염구',
        type: 'attack',
        description: '불꽃을 모아 적을 공격한다. 적에게 화염 데미지를 준다.',
        level: 1,
        mpCost: 8,
        cooldown: 4,
        damage: { min: 10, max: 15, type: 'fire' },
        targetType: 'single',
        requiredLevel: 3,
        requiredClass: 'mage'
      },
      {
        id: 'healing_light',
        name: '치유의 빛',
        type: 'heal',
        description: '신성한 빛으로 자신 또는 아군의 체력을 회복시킨다.',
        level: 1,
        mpCost: 10,
        cooldown: 5,
        healing: { min: 15, max: 20 },
        targetType: 'ally',
        requiredLevel: 3,
        requiredClass: 'cleric'
      }
    ];
    for (const skill of skills) {
      await setDoc(doc(firestore, 'skills', skill.id), skill);
    }

    const classes = [
      {
        id: 'warrior',
        name: '전사',
        description: '강력한 물리 공격과 높은 방어력을 가진 근접 전투 전문가.',
        baseStats: { strength: 10, dexterity: 5, intelligence: 3, vitality: 12 },
        statGrowth: { strength: 2.5, dexterity: 1.5, intelligence: 0.5, vitality: 2 },
        startingSkills: ['basic_strike'],
        startingEquipment: ['rusty_sword', 'leather_armor'],
        unlockLevel: 1
      },
      {
        id: 'mage',
        name: '마법사',
        description: '강력한 마법으로 적을 공격하는 원거리 딜러.',
        baseStats: { strength: 3, dexterity: 5, intelligence: 12, vitality: 5 },
        statGrowth: { strength: 0.5, dexterity: 1.5, intelligence: 2.5, vitality: 1 },
        startingSkills: ['basic_strike', 'fireball'],
        startingEquipment: ['apprentice_staff', 'cloth_robe'],
        unlockLevel: 1
      },
      {
        id: 'cleric',
        name: '성직자',
        description: '신성한 힘으로 아군을 치유하고 언데드를 물리치는 지원형 클래스.',
        baseStats: { strength: 5, dexterity: 3, intelligence: 10, vitality: 7 },
        statGrowth: { strength: 1, dexterity: 1, intelligence: 2, vitality: 1.5 },
        startingSkills: ['basic_strike', 'healing_light'],
        startingEquipment: ['wooden_mace', 'acolyte_robe'],
        unlockLevel: 1
      },
      {
        id: 'rogue',
        name: '도적',
        description: '빠른 공격과 교묘한 기술로 적을 제압하는 민첩한 전투가.',
        baseStats: { strength: 5, dexterity: 12, intelligence: 5, vitality: 6 },
        statGrowth: { strength: 1, dexterity: 2.5, intelligence: 1, vitality: 1.5 },
        startingSkills: ['basic_strike'],
        startingEquipment: ['rusty_dagger', 'leather_vest'],
        unlockLevel: 5
      }
    ];
    for (const classData of classes) {
      await setDoc(doc(firestore, 'classes', classData.id), classData);
    }

    const quests = [
      {
        id: 'first_steps',
        title: '첫 발걸음',
        description: '마을 주변의 야생 토끼 5마리를 사냥하여 마을 장로에게 토끼 고기를 가져다주세요.',
        level: 1,
        requiredLevel: 1,
        objectives: [
          { type: 'kill', targetId: 'wild_rabbit', count: 5, current: 0 }
        ],
        rewards: {
          exp: 50,
          gold: 100,
          items: [
            { id: 'small_health_potion', quantity: 3 }
          ]
        },
        giver: 'village_elder',
        location: 'starter_village',
        nextQuest: 'wolf_threat'
      },
      {
        id: 'wolf_threat',
        title: '늑대의 위협',
        description: '마을 근처에 출몰하는 늑대 새끼들이 위협이 되고 있습니다. 늑대 새끼 10마리를 처치하세요.',
        level: 3,
        requiredLevel: 2,
        objectives: [
          { type: 'kill', targetId: 'wolf_pup', count: 10, current: 0 }
        ],
        rewards: {
          exp: 100,
          gold: 200,
          items: [
            { id: 'leather_gloves', quantity: 1 }
          ]
        },
        giver: 'village_elder',
        location: 'starter_village',
        nextQuest: null
      }
    ];
    for (const quest of quests) {
      await setDoc(doc(firestore, 'quests', quest.id), quest);
    }

    const equipments = [
      {
        id: 'rusty_sword',
        name: '녹슨 검',
        type: 'equipment',
        subType: 'weapon',
        slot: 'mainHand',
        description: '오래된 녹슨 검. 그래도 아무것도 없는 것보다는 낫다.',
        value: 15,
        stats: { attack: 3 },
        requiredLevel: 1,
        requiredStats: { strength: 3 },
        durability: 50,
        maxDurability: 50
      },
      {
        id: 'leather_armor',
        name: '가죽 갑옷',
        type: 'equipment',
        subType: 'armor',
        slot: 'chest',
        description: '기본적인 보호를 제공하는 가죽 갑옷.',
        value: 20,
        stats: { defense: 5 },
        requiredLevel: 1,
        requiredStats: null,
        durability: 60,
        maxDurability: 60
      },
      {
        id: 'apprentice_staff',
        name: '견습 마법사의 지팡이',
        type: 'equipment',
        subType: 'weapon',
        slot: 'mainHand',
        description: '마법 수련생들이 사용하는 기본적인 지팡이.',
        value: 15,
        stats: { attack: 2, magicPower: 5 },
        requiredLevel: 1,
        requiredStats: { intelligence: 5 },
        durability: 40,
        maxDurability: 40
      },
      {
        id: 'cloth_robe',
        name: '천 로브',
        type: 'equipment',
        subType: 'armor',
        slot: 'chest',
        description: '마법사들이 주로 입는 가벼운 로브. 약간의 마법 저항력을 제공한다.',
        value: 18,
        stats: { defense: 2, magicResist: 5 },
        requiredLevel: 1,
        requiredStats: null,
        durability: 30,
        maxDurability: 30
      }
    ];
    for (const equipment of equipments) {
      await setDoc(doc(firestore, 'items', equipment.id), equipment);
    }
};