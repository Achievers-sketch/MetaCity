'use client';
import { useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BuildingType, Building as BuildingData } from '@/lib/types';
import Building from './Building';
import { generateBuildingDescriptionAction } from '@/app/actions';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Coins } from 'lucide-react';

export default function SidePanel() {
  const { state, dispatch } = useGame();
  const { gameParameters, selectedTile, buildings, buildMode } = state;
  const [aiDescription, setAiDescription] = useState<string | null>(null);
  const [isLoadingDescription, setIsLoadingDescription] = useState(false);

  const selectedBuildingId = selectedTile ? state.grid[selectedTile.y][selectedTile.x].buildingId : null;
  const selectedBuilding = selectedBuildingId ? buildings[selectedBuildingId] : null;

  const handleGenerateDescription = async (building: BuildingData) => {
    if (!building) return;
    setIsLoadingDescription(true);
    setAiDescription(null);
    const stats = gameParameters.buildingStats[building.type];
    const productionRate = stats.production?.rate[building.level - 1] || 0;

    const result = await generateBuildingDescriptionAction({
      buildingType: building.type,
      level: building.level,
      productionRate: productionRate,
      description: stats.description,
    });

    if ('description' in result) {
      setAiDescription(result.description);
    } else {
      setAiDescription(result.error);
    }
    setIsLoadingDescription(false);
  };
  
  const renderBuildMenu = () => (
    <div className="space-y-2">
      {Object.entries(gameParameters.buildingStats).map(([type, stats]) => (
        <Card key={type} className={`cursor-pointer hover:bg-muted/50 ${buildMode === type ? 'ring-2 ring-primary' : ''}`} onClick={() => dispatch({ type: 'SET_BUILD_MODE', payload: type as BuildingType })}>
          <CardHeader className="flex flex-row items-center gap-4 p-3">
             <div className="w-10 h-10 flex-shrink-0"><Building type={type as BuildingType} level={1} /></div>
             <div>
                <CardTitle className="text-base">{stats.name}</CardTitle>
                <CardDescription className="text-xs">{stats.description}</CardDescription>
             </div>
          </CardHeader>
          <CardContent className="p-3 pt-0 text-xs flex items-center gap-2 text-amber-400 font-semibold">
            <Coins className="w-3 h-3"/> Cost: {stats.cost[0]} Gold
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderInfoPanel = () => {
    if (!selectedBuilding) {
      return (
        <div className="text-center text-sm text-muted-foreground p-8">
          <p>Select a building on the map to see its details, or choose a building to place from the 'Build' tab.</p>
        </div>
      );
    }

    const stats = gameParameters.buildingStats[selectedBuilding.type];
    const nextLevel = selectedBuilding.level + 1;
    const upgradeCost = stats.cost[selectedBuilding.level];
    const canUpgrade = selectedBuilding.level < stats.maxLevel && state.resources.gold >= upgradeCost;

    return (
        <Card className="bg-transparent border-none shadow-none">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <div className="w-12 h-12 flex-shrink-0"><Building type={selectedBuilding.type} level={selectedBuilding.level}/></div>
                    {stats.name}
                </CardTitle>
                <CardDescription>Level {selectedBuilding.level}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h4 className="font-semibold text-sm mb-2">AI Generated Description</h4>
                    {isLoadingDescription && <p className="text-xs text-muted-foreground animate-pulse">Generating...</p>}
                    {aiDescription && <p className="text-xs text-muted-foreground italic bg-muted/50 p-2 rounded-md">{aiDescription}</p>}
                    <Button size="sm" variant="ghost" className="mt-2" onClick={() => handleGenerateDescription(selectedBuilding)} disabled={isLoadingDescription}>
                        {aiDescription ? "Regenerate" : "Generate"} Description
                    </Button>
                </div>
                <Separator />
                <div className="space-y-2 text-sm">
                    <h4 className="font-semibold">Stats</h4>
                     {stats.production && <p>Production: {stats.production.rate[selectedBuilding.level - 1]} {stats.production.resource}/sec</p>}
                     {stats.effects?.happiness && <p>Happiness: {stats.effects.happiness[selectedBuilding.level - 1]}</p>}
                     <p>Owner: {(selectedBuilding.owner || "Unowned").substring(0, 12)}...</p>
                </div>
                <Separator />
                <div className="space-y-2">
                    {selectedBuilding.level < stats.maxLevel && (
                        <Button className="w-full" onClick={() => dispatch({ type: 'UPGRADE_BUILDING', payload: { buildingId: selectedBuilding.id } })} disabled={!canUpgrade}>
                            Upgrade to Level {nextLevel} ({upgradeCost} Gold)
                        </Button>
                    )}
                    <Button variant="destructive" className="w-full" onClick={() => dispatch({ type: 'DEMOLISH_BUILDING', payload: { buildingId: selectedBuilding.id } })}>
                        Demolish
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
  };

  return (
    <aside className="w-80 border-l bg-card/30 flex flex-col">
      <ScrollArea className="flex-1">
        <Tabs defaultValue="build" className="p-2">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="build">Build</TabsTrigger>
                <TabsTrigger value="info" disabled={!selectedBuilding}>Info</TabsTrigger>
            </TabsList>
            <TabsContent value="build" className="mt-4">
                {renderBuildMenu()}
            </TabsContent>
            <TabsContent value="info" className="mt-4">
                {renderInfoPanel()}
            </TabsContent>
        </Tabs>
      </ScrollArea>
    </aside>
  );
}
