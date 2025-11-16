import { BuildingType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Home, Landmark, Factory, Trees, Minus } from 'lucide-react';

interface BuildingProps {
  type: BuildingType;
  level: number;
  className?: string;
}

const buildingStyles: Record<BuildingType, string> = {
    residential: "bg-blue-500/50 border-blue-400",
    commercial: "bg-purple-500/50 border-purple-400",
    industrial: "bg-gray-600/50 border-gray-500",
    park: "bg-green-600/50 border-green-500",
    road: "bg-gray-400/50 border-gray-400",
}

const levelStyles: string[] = [
    "scale-75",
    "scale-90",
    "scale-100",
]

export default function Building({ type, level, className }: BuildingProps) {
    const baseStyle = "w-full h-full rounded-md border-2 flex items-center justify-center transition-all duration-300";
    const typeStyle = buildingStyles[type];
    const levelStyle = levelStyles[level - 1] || "scale-100";

    const Icon = ({type, level}: {type: BuildingType, level: number}) => {
        const iconProps = { className: "text-white/80 transition-all", size: 24 + (level * 4) }
        switch(type) {
            case 'residential': return <Home {...iconProps} />;
            case 'commercial': return <Landmark {...iconProps} />;
            case 'industrial': return <Factory {...iconProps} />;
            case 'park': return <Trees {...iconProps} />;
            case 'road': return <Minus {...iconProps} size={48} />;
            default: return null;
        }
    }

  return (
    <div className={cn(baseStyle, typeStyle, levelStyle, className)}>
        <div className="relative">
            <Icon type={type} level={level} />
            {type !== 'road' && (
              <span className="absolute -top-1 -right-1 bg-background text-foreground text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center border">
                  {level}
              </span>
            )}
        </div>
    </div>
  );
}
