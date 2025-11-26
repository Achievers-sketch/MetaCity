'use client';

import { useEffect, useState } from 'react';
import { Newspaper } from 'lucide-react';
import { generateInGameNewsHeadline } from '@/ai/flows/generate-news-headline';
import { useGame } from '@/contexts/GameContext';
import { InGameNewsHeadlineOutput } from '@/lib/types';

export default function NewsTicker() {
  const [news, setNews] = useState<string>('City council approves new park construction.');
  const { state } = useGame();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const result: InGameNewsHeadlineOutput = await generateInGameNewsHeadline(state.resources);
        setNews(result.headline);
      } catch (error) {
        console.error('Failed to fetch in-game news:', error);
      }
    };

    // Fetch news on initial load and then every 60 seconds
    fetchNews();
    const intervalId = setInterval(fetchNews, 60000);

    return () => clearInterval(intervalId);
  }, [state.resources]);

  return (
    <div className="absolute bottom-10 left-0 right-0 flex justify-center pointer-events-none">
      <div className="flex items-center gap-2 p-2 px-4 rounded-full bg-card/70 backdrop-blur-sm border shadow-lg pointer-events-auto">
        <Newspaper className="h-5 w-5 text-primary" />
        <p className="text-sm text-foreground animate-pulse">{news}</p>
      </div>
    </div>
  );
}
