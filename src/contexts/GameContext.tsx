'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { GameState, GameAction, Building, MarketItem, Proposal, TileData } from '@/lib/types';
import { INITIAL_GAME_STATE, GAME_STATE_KEY, AUTOSAVE_INTERVAL, TICK_RATE, PROPOSAL_DURATION } from '@/lib/constants';
import { calculateResourceGains } from '@/lib/game-logic';
import { useAccount } from 'wagmi';

const GameContext = createContext<{ state: GameState; dispatch: React.Dispatch<GameAction> } | undefined>(undefined);

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'LOAD_STATE':
        return { ...action.payload, isLoading: false };
    case 'SET_IS_LOADING':
        return { ...state, isLoading: action.payload };

    case 'TICK': {
      const now = action.payload.now;
      const timeElapsed = now - state.lastUpdate;
      if (timeElapsed < TICK_RATE / 2) return state; // Avoid rapid updates

      const gains = calculateResourceGains(state, timeElapsed);
      
      const newResources = { ...state.resources };
      newResources.gold += gains.gold;
      newResources.citizens += gains.citizens;
      
      const baseHappiness = 50 + gains.happiness;
      const happinessDrift = (baseHappiness - state.resources.happiness) * 0.1;
      newResources.happiness = Math.max(0, Math.min(100, state.resources.happiness + happinessDrift));

      return { ...state, resources: newResources, lastUpdate: now };
    }
    
    case 'CONNECT_WALLET':
      if (state.wallet.connected && state.wallet.address === action.payload) return state;
      return { ...state, wallet: { connected: true, address: action.payload } };
    
    case 'DISCONNECT_WALLET':
      return { ...state, wallet: { connected: false, address: null } };

    case 'SET_BUILD_MODE':
      return { ...state, buildMode: action.payload, selectedTile: null };

    case 'SELECT_TILE':
      return { ...state, selectedTile: action.payload, buildMode: null };

    case 'PLACE_BUILDING': {
      if (!state.buildMode || !state.wallet.address) return state;
      const { position, type } = action.payload;
      const tile = state.grid[position.y][position.x];
      if (!tile || tile.buildingId || tile.owner !== state.wallet.address) return state;

      const cost = state.gameParameters.buildingStats[type].cost[0];
      if (state.resources.gold < cost) return state;

      const newBuilding: Building = {
        id: `bldg_${Date.now()}`,
        owner: state.wallet.address,
        type,
        level: 1,
        position,
        createdAt: Date.now(),
      };

      const newGrid = [...state.grid];
      newGrid[position.y][position.x].buildingId = newBuilding.id;

      const newBuildings = { ...state.buildings, [newBuilding.id]: newBuilding };
      const newNfts = [...state.nfts, { ...newBuilding, tokenId: newBuilding.id, type: 'building' }];
      const newResources = { ...state.resources, gold: state.resources.gold - cost };
      
      return { ...state, grid: newGrid, buildings: newBuildings, nfts: newNfts, resources: newResources, buildMode: null };
    }
    
    case 'UPGRADE_BUILDING': {
      const building = state.buildings[action.payload.buildingId];
      if (!building || !state.wallet.address || building.owner !== state.wallet.address) return state;

      const stats = state.gameParameters.buildingStats[building.type];
      if (building.level >= stats.maxLevel) return state;

      const cost = stats.cost[building.level];
      if (state.resources.gold < cost) return state;
      
      const upgradedBuilding = { ...building, level: building.level + 1 };
      const newBuildings = { ...state.buildings, [building.id]: upgradedBuilding };
      const newResources = { ...state.resources, gold: state.resources.gold - cost };
      
      return { ...state, buildings: newBuildings, resources: newResources };
    }

    case 'DEMOLISH_BUILDING': {
      const building = state.buildings[action.payload.buildingId];
      if (!building || !state.wallet.address || building.owner !== state.wallet.address) return state;

      const newBuildings = { ...state.buildings };
      delete newBuildings[action.payload.buildingId];

      const newGrid = [...state.grid];
      newGrid[building.position.y][building.position.x].buildingId = null;

      const newNfts = state.nfts.filter(nft => nft.id !== building.id);
      
      return { ...state, buildings: newBuildings, grid: newGrid, nfts: newNfts, selectedTile: null };
    }
    
    case 'CREATE_PROPOSAL': {
      if (!state.wallet.address) return state;
      const now = Date.now();
      const newProposal: Proposal = {
        ...action.payload,
        id: `prop_${now}`,
        proposer: state.wallet.address,
        status: 'active',
        votes: { for: 0, against: 0 },
        voters: {},
        createdAt: now,
        endsAt: now + PROPOSAL_DURATION,
      };
      return { ...state, proposals: [...state.proposals, newProposal] };
    }

    case 'VOTE_ON_PROPOSAL': {
      if (!state.wallet.address) return state;
      const proposal = state.proposals.find(p => p.id === action.payload.proposalId);
      if (!proposal || proposal.status !== 'active' || proposal.voters[state.wallet.address]) return state;

      const votingPower = state.nfts.filter(nft => (nft as (Building | TileData)).owner === state.wallet.address).length || 1;
      
      const updatedProposal = { ...proposal };
      updatedProposal.votes[action.payload.vote] += votingPower;
      updatedProposal.voters[state.wallet.address] = action.payload.vote;

      const newProposals = state.proposals.map(p => p.id === updatedProposal.id ? updatedProposal : p);
      return { ...state, proposals: newProposals };
    }
    
    case 'EXECUTE_PROPOSALS': {
        // In a real scenario, this would be a complex, secure process.
        // For simulation, we'll just check for passed proposals that ended.
        const now = Date.now();
        let newParams = { ...state.gameParameters };
        const newProposals = state.proposals.map(p => {
            if (p.status === 'active' && now > p.endsAt) {
                if (p.votes.for > p.votes.against) {
                    p.status = 'passed';
                    const { type, payload } = p.action;
                    if (type === 'UPDATE_BUILDING_COST') {
                        newParams.buildingStats[payload.buildingType].cost[payload.level - 1] = payload.newCost;
                    } else if (type === 'UPDATE_PRODUCTION_RATE') {
                         if(newParams.buildingStats[payload.buildingType].production) {
                            newParams.buildingStats[payload.buildingType].production!.rate[payload.level - 1] = payload.newRate;
                         }
                    }
                } else {
                    p.status = 'failed';
                }
            }
            return p;
        });

        return { ...state, proposals: newProposals, gameParameters: newParams };
    }
    
    case 'LIST_ITEM': {
      if (!state.wallet.address) return state;
      const { item, price } = action.payload;
      const newItem: MarketItem = {
        id: `market_${item.id}`,
        tokenId: item.id,
        seller: state.wallet.address,
        price,
        type: 'building',
        item,
      };
      
      // Remove from player's possession
      const newBuildings = { ...state.buildings };
      delete newBuildings[item.id];
      const newGrid = [...state.grid];
      newGrid[item.position.y][item.position.x].buildingId = null;

      return { ...state, market: [...state.market, newItem], buildings: newBuildings, grid: newGrid };
    }

    case 'BUY_ITEM': {
      if (!state.wallet.address) return state;
      const item = state.market.find(i => i.id === action.payload.marketItemId);
      if (!item || state.resources.gold < item.price) return state;
      
      const newMarket = state.market.filter(i => i.id !== item.id);
      const newResources = { ...state.resources, gold: state.resources.gold - item.price };

      // Simplified: Find an empty owned tile to place the building
      let placed = false;
      const newGrid = [...state.grid];
      for(let y = 0; y < state.grid.length; y++) {
          for(let x = 0; x < state.grid[y].length; x++) {
              const tile = state.grid[y][x];
              if (tile.owner === state.wallet.address && !tile.buildingId) {
                  const boughtBuilding = { ...item.item, owner: state.wallet.address, position: {x, y} };
                  const newBuildings = { ...state.buildings, [boughtBuilding.id]: boughtBuilding };
                  newGrid[y][x].buildingId = boughtBuilding.id;
                  
                  // Update NFT ownership
                  const newNfts = state.nfts.map(nft => nft.id === item.tokenId ? { ...nft, owner: state.wallet.address } : nft);

                  return { ...state, buildings: newBuildings, grid: newGrid, market: newMarket, resources: newResources, nfts: newNfts };
              }
          }
      }
      // If no space, refund (or handle differently)
      return state;
    }
    
    case 'TOGGLE_TUTORIAL':
      return { ...state, isTutorialOpen: action.payload };

    case 'SET_TUTORIAL_STEP':
      return { ...state, tutorialStep: action.payload };

    default:
      return state;
  }
}

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_GAME_STATE);
  const { address, isConnected, isDisconnected } = useAccount();

  useEffect(() => {
    if (isConnected && address) {
      dispatch({ type: 'CONNECT_WALLET', payload: address });
    } else if (isDisconnected) {
      dispatch({ type: 'DISCONNECT_WALLET' });
    }
  }, [address, isConnected, isDisconnected]);

  useEffect(() => {
    try {
      const savedStateJSON = localStorage.getItem(GAME_STATE_KEY);
      if (savedStateJSON) {
        const savedState = JSON.parse(savedStateJSON);
        dispatch({ type: 'LOAD_STATE', payload: savedState });
      } else {
        dispatch({ type: 'SET_IS_LOADING', payload: false });
      }
    } catch (error) {
      console.error("Failed to load game state:", error);
      dispatch({ type: 'SET_IS_LOADING', payload: false });
    }
  }, []);

  useEffect(() => {
    if (state.isLoading) return;
    const saveInterval = setInterval(() => {
      try {
        localStorage.setItem(GAME_STATE_KEY, JSON.stringify(state));
      } catch (error) {
        console.error("Failed to save game state:", error);
      }
    }, AUTOSAVE_INTERVAL);
    return () => clearInterval(saveInterval);
  }, [state]);

  useEffect(() => {
    if (state.isLoading) return;
    const gameLoop = setInterval(() => {
      dispatch({ type: 'TICK', payload: { now: Date.now() } });
      dispatch({ type: 'EXECUTE_PROPOSALS' });
    }, TICK_RATE);
    return () => clearInterval(gameLoop);
  }, [state.isLoading]);
  
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
