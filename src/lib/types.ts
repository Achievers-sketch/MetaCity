import { z } from 'zod';

export type BuildingType = 'residential' | 'commercial' | 'industrial' | 'park' | 'road';
export type ResourceName = 'gold' | 'citizens' | 'happiness';

export type Position = {
  x: number;
  y: number;
};

export interface Building {
  id: string;
  owner: string;
  type: BuildingType;
  level: number;
  position: Position;
  createdAt: number;
}

export interface TileData {
  id: string;
  x: number;
  y: number;
  buildingId: string | null;
  owner?: string;
}

export type Grid = TileData[][];

export type ProposalAction = {
  type: 'UPDATE_BUILDING_COST';
  payload: {
    buildingType: BuildingType;
    level: number;
    newCost: number;
  };
} | {
  type: 'UPDATE_PRODUCTION_RATE';
  payload: {
    buildingType: BuildingType;
    level: number;
    newRate: number;
  };
};

export interface Proposal {
  id: string;
  title: string;
  description: string;
  proposer: string;
  status: 'active' | 'passed' | 'failed';
  votes: {
    for: number;
    against: number;
  };
  voters: Record<string, 'for' | 'against'>;
  action: ProposalAction;
  createdAt: number;
  endsAt: number;
}

export interface MarketItem {
  id: string;
  tokenId: string; // This would be the building or land NFT id
  seller: string;
  price: number;
  type: 'building' | 'land';
  item: Building;
}

export interface Wallet {
  address: string | null;
  connected: boolean;
}

export interface BuildingStats {
  name: string;
  description: string;
  maxLevel: number;
  cost: number[];
  production?: {
    resource: ResourceName;
    rate: number[];
  };
  effects?: {
    happiness?: number[];
  };
}

export interface GameParameters {
  buildingStats: Record<BuildingType, BuildingStats>;
  adjacencyBonus: number;
}

export interface GameState {
  resources: Record<ResourceName, number>;
  grid: Grid;
  buildings: Record<string, Building>;
  nfts: (Building | TileData)[];
  market: MarketItem[];
  proposals: Proposal[];
  wallet: Wallet;
  gameParameters: GameParameters;
  selectedTile: Position | null;
  buildMode: BuildingType | null;
  tutorialStep: number;
  isTutorialOpen: boolean;
  lastUpdate: number;
  isLoading: boolean;
}

export type GameAction =
  | { type: 'TICK'; payload: { now: number } }
  | { type: 'CONNECT_WALLET', payload: string }
  | { type: 'DISCONNECT_WALLET' }
  | { type: 'SET_BUILD_MODE'; payload: BuildingType | null }
  | { type: 'SELECT_TILE'; payload: Position | null }
  | { type: 'PLACE_BUILDING'; payload: { position: Position; type: BuildingType } }
  | { type: 'UPGRADE_BUILDING'; payload: { buildingId: string } }
  | { type: 'DEMOLISH_BUILDING'; payload: { buildingId: string } }
  | { type: 'CREATE_PROPOSAL'; payload: Omit<Proposal, 'id' | 'proposer' | 'status' | 'votes' | 'voters' | 'createdAt' | 'endsAt'> }
  | { type: 'VOTE_ON_PROPOSAL'; payload: { proposalId: string; vote: 'for' | 'against' } }
  | { type: 'EXECUTE_PROPOSALS' }
  | { type: 'LIST_ITEM'; payload: { item: Building; price: number } }
  | { type: 'BUY_ITEM'; payload: { marketItemId: string } }
  | { type: 'SET_TUTORIAL_STEP'; payload: number }
  | { type: 'TOGGLE_TUTORIAL'; payload: boolean }
  | { type: 'LOAD_STATE'; payload: GameState }
  | { type: 'SET_IS_LOADING'; payload: boolean };


// AI Schema Types

export const InGameNewsHeadlineInputSchema = z.object({
  gold: z.number().describe('The current amount of gold tokens the player has.'),
  citizens: z.number().describe('The current number of citizens in the city.'),
  happiness: z.number().describe('The current happiness level of the city.'),
});

export type InGameNewsHeadlineInput = z.infer<typeof InGameNewsHeadlineInputSchema>;

export const InGameNewsHeadlineOutputSchema = z.object({
  headline: z.string().describe('A short, engaging news headline for a city-builder game, inspired by a real-world event.'),
});

export type InGameNewsHeadlineOutput = z.infer<typeof InGameNewsHeadlineOutputSchema>;
