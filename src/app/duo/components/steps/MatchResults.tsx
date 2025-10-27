import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageSquare, Trophy, Clock, Users, Crown } from "lucide-react";
import { mockMatches } from "../../constants/mockMatches";
import { rankNeonColors } from "../../constants/profile";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MatchResultsProps {
  onBack: () => void;
}

export const MatchResults = ({ onBack }: MatchResultsProps) => {
  const [likedProfiles, setLikedProfiles] = useState<number[]>([]);

  const toggleLike = (profileId: number) => {
    setLikedProfiles(prev => 
      prev.includes(profileId) 
        ? prev.filter(id => id !== profileId)
        : [...prev, profileId]
    );
  };

  return (
      <div className="h-auto w-screen">
        <div className="w-full max-w-6xl mx-auto animate-slide-in-up mt-8 pb-6">
          {/* Header */}
            <div className="text-center mt-20 mb-4">
              <p className="text-muted-foreground text-lg">
                {mockMatches.length} jogadores compatíveis encontrados para duo
              </p>
            </div>
          {/* <ScrollArea className="h-[40rem] w-full"> */}
            {/* Match Cards Grid */}
            <div className="grid md:grid-cols-2 xl:grid-cols-2 gap-6 mb-8 place-items-center justify-center">
              {mockMatches.map((match, index) => {
                const isLiked = likedProfiles.includes(match.id);
                const isOnline = match.lastOnline === "Online";
                
                return (
                  <div
                    key={match.id}
                    className="card-glass bg-[#0F172A] rounded-xl p-6 animate-fade-in-scale hover:scale-105 transition-all duration-300 w-[30rem]"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <img
                            src={match.avatar}
                            alt={match.name}
                            className="w-16 h-16 rounded-full border-2 border-primary/30"
                          />
                          {isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-neon-green rounded-full border-2 border-background animate-pulse" />
                          )}
                        </div>
                        
                        <div>
                          <h3 className="text-xl font-bold text-card-foreground">
                            {match.name}
                          </h3>
                          <p className="text-primary text-sm font-medium">{match.tag}</p>
                          <p className="text-muted-foreground text-sm">Level {match.level}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30 mb-2">
                          {match.compatibility}% Match
                        </Badge>
                        <div className="text-sm text-muted-foreground">
                          {match.lastOnline}
                        </div>
                      </div>
                    </div>

                    {/* Rank & Stats */}
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Crown className={`w-5 h-5 ${rankNeonColors[match.rank.split(" ")[0]]}`} />
                          <span className={`font-semibold ${rankNeonColors[match.rank.split(" ")[0]]}`}>{match.rank}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Win Rate</div>
                          <div className="text-lg font-bold text-primary">{match.winRate}%</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Main</div>
                          <div className="font-semibold text-neon-purple">{match.mainRole}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Secondary</div>
                          <div className="font-semibold text-muted-foreground">{match.secondaryRole}</div>
                        </div>
                      </div>
                    </div>

                    {/* Champions */}
                    <div className="mb-6">
                      <div className="text-sm text-muted-foreground mb-2">Main Champions</div>
                      <div className="flex flex-wrap gap-2">
                        {match.championsPlayed.map((champ) => (
                          <Badge
                            key={champ}
                            variant="outline"
                            className="text-xs border-border/50 text-muted-foreground"
                          >
                            {champ}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Preferences */}
                    <div className="flex items-center space-x-6 mb-6 text-sm">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{match.playTime}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{match.age} anos</span>
                      </div>
                      {/* {match.voiceChat && (
                        <Badge className="bg-neon-blue/20 text-neon-blue border-neon-blue/30 text-xs">
                          Voice Chat
                        </Badge>
                      )} */}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                      <Button
                        onClick={() => toggleLike(match.id)}
                        variant={isLiked ? "default" : "outline"}
                        className={`
                          flex-1 transition-all duration-300
                          ${isLiked 
                            ? 'bg-destructive/20 text-destructive border-destructive/30 hover:bg-destructive/30' 
                            : 'hover:border-destructive/50 hover:text-destructive'
                          }
                        `}
                      >
                        <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                        {isLiked ? 'Liked' : 'Like'}
                      </Button>
                      
                      <Button
                        className="flex-1 bg-gradient-primary hover:shadow-glow-primary text-primary-foreground transition-all duration-300"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Message
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          {/* </ScrollArea> */}

          {/* Action Buttons */}
          <div className="flex justify-center space-x-6 mb-20">
            <Button
              onClick={onBack}
              variant="outline"
              className="px-8 py-3 text-muted-foreground border-border hover:border-primary/50 hover:text-primary transition-all duration-300"
            >
              Back to Filters
            </Button>
            <Button
              className="bg-gradient-secondary hover:shadow-glow-secondary text-secondary-foreground px-12 py-3 font-semibold rounded-xl transition-all duration-300 hover:scale-105"
            >
              <Trophy className="w-5 h-5 mr-2" />
              View Liked ({likedProfiles.length})
            </Button>
          </div>
        </div>
      </div>
  );
};