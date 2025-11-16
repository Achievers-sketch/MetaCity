import { Card } from '@/components/ui/card';

interface ResourceDisplayProps {
  icon: React.ReactNode;
  value: number;
  name: string;
}

export default function ResourceDisplay({ icon, value, name }: ResourceDisplayProps) {
  return (
    <Card className="flex items-center gap-2 p-2 px-3 bg-background/70">
      {icon}
      <div className="flex flex-col items-start">
        <span className="font-bold text-sm leading-none">{value}</span>
        <span className="text-xs text-muted-foreground leading-none">{name}</span>
      </div>
    </Card>
  );
}
