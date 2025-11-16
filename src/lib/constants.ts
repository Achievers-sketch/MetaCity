import type { GameState, GameParameters, Grid, TileData } from './types';

export const GRID_SIZE = 20;
export const TICK_RATE = 1000; // 1 second
export const AUTOSAVE_INTERVAL = 30000; // 30 seconds
export const PROPOSAL_DURATION = 3 * 60 * 1000; // 3 minutes for demo purposes

export const GAME_STATE_KEY = 'metacity_gamestate';

const initialGameParameters: GameParameters = {
  adjacencyBonus: 0.2,
  buildingStats: {
    residential: {
      name: 'Residential',
      description: 'Generates citizens for your city.',
      maxLevel: 3,
      cost: [50, 150, 400],
      production: {
        resource: 'citizens',
        rate: [1, 2, 5],
      },
    },
    commercial: {
      name: 'Commercial',
      description: 'Generates Gold tokens.',
      maxLevel: 3,
      cost: [100, 300, 800],
      production: {
        resource: 'gold',
        rate: [10, 25, 70],
      },
    },
    industrial: {
      name: 'Industrial',
      description: 'Produces a large amount of Gold but lowers happiness.',
      maxLevel: 3,
      cost: [200, 600, 1500],
      production: {
        resource: 'gold',
        rate: [30, 80, 200],
      },
      effects: {
        happiness: [-2, -5, -10],
      },
    },
    park: {
      name: 'Park',
      description: 'Increases the happiness of your citizens.',
      maxLevel: 3,
      cost: [150, 400, 1000],
      effects: {
        happiness: [5, 12, 25],
      },
    },
    road: {
      name: 'Road',
      description: 'Connects buildings, providing adjacency bonuses.',
      maxLevel: 1,
      cost: [10],
    },
  },
};

const initialGrid: Grid = Array.from({ length: GRID_SIZE }, (_, y) =>
  Array.from({ length: GRID_SIZE }, (_, x) => ({
    id: `tile_${x}_${y}`,
    x,
    y,
    buildingId: null,
  }))
);

const initialPlayerAddress = '0xPlayer1...';

// Pre-mint 3 land parcels and add one residential building
const initialBuildings: Record<string, any> = {};
const initialNfts: any[] = [];
const startPositions = [{ x: 9, y: 9 }, { x: 10, y: 9 }, { x: 11, y: 9 }];

startPositions.forEach((pos, index) => {
    const tile = initialGrid[pos.y][pos.x];
    tile.owner = initialPlayerAddress;
    initialNfts.push({ ...tile, tokenId: `land_${tile.id}`, owner: initialPlayerAddress, type: 'land', mintedAt: Date.now() });

    if (index === 0) {
        const buildingId = `building_${Date.now()}`;
        const residentialBuilding = {
            id: buildingId,
            owner: initialPlayerAddress,
            type: 'residential',
            level: 1,
            position: pos,
            createdAt: Date.now(),
        };
        initialBuildings[buildingId] = residentialBuilding;
        tile.buildingId = buildingId;
        initialNfts.push({ ...residentialBuilding, tokenId: `bldg_${residentialBuilding.id}`, type: 'building' });
    }
});


export const INITIAL_GAME_STATE: GameState = {
  resources: {
    gold: 1000,
    citizens: 10,
    happiness: 50,
  },
  grid: initialGrid,
  buildings: initialBuildings,
  nfts: initialNfts,
  market: [
    // Pre-populated listings for demo
    {
      id: `market_item_${Date.now()}`,
      tokenId: 'dummy_bldg_1',
      seller: '0xSystem',
      price: 500,
      type: 'building',
      item: {
        id: 'dummy_bldg_1',
        owner: '0xSystem',
        type: 'commercial',
        level: 2,
        position: { x: 1, y: 1 },
        createdAt: Date.now(),
      }
    }
  ],
  proposals: [],
  wallet: {
    address: null,
    connected: false,
  },
  gameParameters: initialGameParameters,
  selectedTile: null,
  buildMode: null,
  tutorialStep: 0,
  isTutorialOpen: true,
  lastUpdate: Date.now(),
  isLoading: true,
};
