import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Calendar, Users, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TrendingTopic {
  id: string;
  title: string;
  category: string;
  description: string;
  participants?: number;
  icon: React.ComponentType<{ className?: string }>;
}

const trendingTopics: TrendingTopic[] = [
  {
    id: '1',
    title: 'Counter Strike 2',
    category: 'Thread',
    description: 'O LoL está acabando',
    icon: TrendingUp
  },
  {
    id: '2',
    title: 'Top 1 Jett Valorant',
    category: 'Rank',
    description: 'Até 7 do Valorant, veja tudo da nova aqui.',
    icon: Trophy
  },
  {
    id: '3',
    title: 'Rei do LoL',
    category: 'Notícia',
    description: 'Quinto campeonato de disputa de olos eu queroque mesmo esquera com isso que bresa que brateglestaca rairh...',
    participants: 1250,
    icon: Users
  },
  {
    id: '4',
    title: 'Torneio Apex',
    category: 'Evento',
    description: 'Competições de alto nível acontecendo agora',
    participants: 890,
    icon: Calendar
  }
];

const getCategoryColor = (category: string) => {
  switch (category.toLowerCase()) {
    case 'thread': return 'bg-neon-blue/20 text-neon-blue border-neon-blue/30';
    case 'rank': return 'bg-secondary-start/20 text-secondary-start border-secondary-start/30';
    case 'notícia': return 'bg-neon-green/20 text-neon-green border-neon-green/30';
    case 'evento': return 'bg-neon-purple/20 text-neon-purple border-neon-purple/30';
    default: return 'bg-muted text-muted-foreground';
  }
};

export const TrendingTopics = () => {
  return (
    <Card className="bg-card border-border/50 backdrop-blur-sm animate-fade-up hover:shadow-glow-primary/30 hover:scale-[1.02] hover:border-primary/40 transition-all duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-neon-green" />
          <span>Assuntos do momento</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {trendingTopics.map((topic, index) => (
          <div 
            key={topic.id}
            className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 hover:shadow-improved transition-all duration-200 cursor-pointer group animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <topic.icon className="w-4 h-4 text-primary" />
                <h4 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                  {topic.title}
                </h4>
              </div>
              <Badge 
                variant="outline" 
                className={`text-xs px-2 py-1 ${getCategoryColor(topic.category)}`}
              >
                {topic.category}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              {topic.description}
            </p>
            
            {topic.participants && (
              <div className="flex items-center space-x-1 text-xs text-neon-green">
                <Users className="w-3 h-3" />
                <span className="font-medium">{topic.participants.toLocaleString()}</span>
                <span className="text-muted-foreground">participantes</span>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};