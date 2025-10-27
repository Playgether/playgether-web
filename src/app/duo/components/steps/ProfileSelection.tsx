import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { profiles, rankNeonColors, roles } from "../../constants/profile";

interface ProfileSelectionProps {
  onNext: () => void;
}

export const ProfileSelection = ({ onNext }: ProfileSelectionProps) => {
  const [secondRole, setSecondRole] = useState<string>('Top');
  return (
    <div className="w-screen min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-4xl animate-slide-in-up">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent h-14">
            League of Legends
          </h1>
        </div>

        {/* Profile Cards */}
        <div className="flex items-center justify-center gap-8 mb-12">
          {profiles.map((profile) => {
            const IconComponent = profile.icon;
            
            return (
              <div
                key={profile.id}
                className="card-glass rounded-xl p-8 group animate-fade-in-scale w-[25rem]"
                style={{ animationDelay: `${profiles.indexOf(profile) * 0.1}s` }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-16 h-16 bg-gradient-${profile.color === 'primary' ? 'primary' : 'secondary'} rounded-xl flex items-center justify-center shadow-glow-${profile.color === 'primary' ? 'primary' : 'secondary'}`}>
                    <IconComponent className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Level</div>
                    <div className="text-2xl font-bold text-primary">{profile.level}</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="text-2xl font-bold text-card-foreground">
                      {profile.name}
                    </h3>
                    <p className="text-primary text-sm font-medium">{profile.tag}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Rank</div>
                      <div className={`text-lg font-semibold ${rankNeonColors[profile.rank.split(" ")[0]]}`}>{profile.rank}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Main Role</div>
                      <div className="text-lg font-semibold text-neon-purple">{profile.mainRole}</div>
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground">
                        Second Role
                      </div>
                      
                      <div>
                            <Select
                                onValueChange={value => setSecondRole(value)}
                                value={secondRole}
                            >
                                <SelectTrigger className="bg-transparent border-none shadow-none px-0 h-auto focus:ring-0 focus:border-none text-lg font-semibold">
                                  <span className="text-neon-purple">
                                    <SelectValue placeholder="" />
                                  </span>
                                </SelectTrigger>

                                <SelectContent>
                                <SelectGroup>
                                    {roles.map((role) => (
                                    <SelectItem key={role} value={role}>
                                        {role}
                                    </SelectItem>
                                    ))}
                                </SelectGroup>
                                </SelectContent>
                            </Select>
                      </div>
                    </div>
                  </div>
                </div>
  
                {/* Stats Bar */}
                <div className="mt-6 pt-4 border-t border-border/30">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-neon-green" />
                      <span className="text-sm text-muted-foreground">Online</span>
                    </div>
                    {/* <div className="text-sm text-muted-foreground">
                      Last played: 2 hours ago
                    </div> */}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <Button
            onClick={onNext}
            className="bg-gradient-primary hover:shadow-glow-primary text-primary-foreground px-12 py-4 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105"
          >
            Continar
          </Button>
        </div>
      </div>
    </div>
  );
};