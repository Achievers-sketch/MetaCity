import type { GameState, Position, BuildingType } from './types';

function getNeighbors(pos: Position, gridSize: number): Position[] {
  const { x, y } = pos;
  const neighbors: Position[] = [];
  if (x > 0) neighbors.push({ x: x - 1, y });
  if (x < gridSize - 1) neighbors.push({ x: x + 1, y });
  if (y > 0) neighbors.push({ x, y: y - 1 });
  if (y < gridSize - 1) neighbors.push({ x, y: y + 1 });
  return neighbors;
}

function hasAdjacentRoad(pos: Position, state: GameState): boolean {
  const neighbors = getNeighbors(pos, state.grid.length);
  return neighbors.some(n => {
    const tile = state.grid[n.y][n.x];
    if (tile.buildingId) {
      const building = state.buildings[tile.buildingId];
      return building && building.type === 'road';
    }
    return false;
  });
}

export function calculateResourceGains(state: GameState, timeElapsed: number) {
  const gains = {
    gold: 0,
    citizens: 0,
    happiness: 0,
  };
  let happinessEffect = 0;

  for (const building of Object.values(state.buildings)) {
    const stats = state.gameParameters.buildingStats[building.type];
    if (!stats) continue;

    let productionMultiplier = 1;
    
    // Apply adjacency bonus (excluding roads themselves)
    if (building.type !== 'road' && hasAdjacentRoad(building.position, state)) {
        productionMultiplier += state.gameParameters.adjacencyBonus;
    }

    // Production buildings
    if (stats.production) {
      const productionRate = stats.production.rate[building.level - 1] || 0;
      gains[stats.production.resource] += (productionRate * productionMultiplier * timeElapsed) / 1000;
    }

    // Happiness effects
    if (stats.effects?.happiness) {
      happinessEffect += stats.effects.happiness[building.level - 1] || 0;
    }
  }

  // Happiness affects production
  const happinessMultiplier = Math.max(0.5, 1 + (state.resources.happiness - 50) / 100);
  gains.gold *= happinessMultiplier;
  gains.citizens *= happinessMultiplier;

  gains.happiness = happinessEffect;

  return gains;
}

export function getTutorialSuggestion(state: GameState): { title: string, description: string } {
    if (state.tutorialStep === 0) return { title: "Welcome to MetaCity!", description: "Let's get started. Click the 'Connect Wallet' button on the top right to join the network." };
    if (state.tutorialStep === 1) return { title: "Place a Building", description: "You own some land. Select 'Commercial' from the Build menu on the right, then click an empty tile you own on the map to build it." };
    
    const { resources, buildings } = state;
    const buildingCounts = Object.values(buildings).reduce((acc, b) => {
        acc[b.type] = (acc[b.type] || 0) + 1;
        return acc;
    }, {} as Record<BuildingType, number>);

    if (resources.happiness < 40) {
        return { title: "Boost Happiness", description: "Your citizens are unhappy! Build a Park to improve their mood and boost overall productivity." };
    }
    if (resources.gold < 200 && (buildingCounts.commercial || 0) < 2) {
        return { title: "Increase Income", description: "Your treasury is low. Build more Commercial buildings to generate more Gold tokens." };
    }
    if (resources.citizens < 20 && (buildingCounts.residential || 0) < 3) {
        return { title: "Grow Population", description: "You need more citizens to operate your city. Build Residential structures to attract more people." };
    }
    if (!Object.values(buildings).some(b => b.type === 'road')) {
        return { title: "Build Roads", description: "Connect your buildings with Roads to give them a 20% production bonus!" };
    }

    return { title: "City Expansion", description: "Your city is growing! Try upgrading a building by selecting it on the map and clicking 'Upgrade' on the right panel." };
}
