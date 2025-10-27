import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Filter, Trophy, Clock, Users } from "lucide-react";
import { servers } from "../../constants/servers";
import { ranks } from "../../constants/ranks";
import { filters } from "../../constants/filters";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

interface EloFilterProps {
  onNext: () => void;
  onBack: () => void;
}

export const EloFilter = ({ onNext, onBack }: EloFilterProps) => {
  const [selectedRanks, setSelectedRanks] = useState<string[]>(["Gold"]);
  const [selectedServer, setSelectedServer] = useState("BR");
  const [ageRange, setAgeRange] = useState([18]);
  const [playTime, setPlayTime] = useState("evening");
//   const [voiceChat, setVoiceChat] = useState(true);
//   const [duoOnly, setDuoOnly] = useState(true);

 const handleRankChange = (rank: string) => {
  setSelectedRanks((prev) => prev.includes(rank) ? prev.filter((r) => r !== rank) : [...prev, rank]);
 } 

  return (
    <div className="min-h-screen w-screen flex items-center justify-center p-6">
      <div className="w-full max-w-4xl animate-slide-in-up">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Filter className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-card-foreground">
              Filtre Seu Match
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Defina suas preferências para encontrar o parceiro ideal
          </p>
        </div>

        {/* Filter Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Rank & Server */}
          <div className="card-glass rounded-xl p-6 space-y-6">
            <div className="flex items-center space-x-3 mb-4">
              <Trophy className="w-6 h-6 text-accent" />
              <h3 className="text-xl font-bold text-card-foreground">Rank & Server</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Ranks
                </label>
                <Popover>
                  <PopoverTrigger className="bg-input/50
                    border
                    border-border
                    rounded-lg
                    px-4
                    py-2
                    w-full
                    text-left
                    focus:border-primary
                    transition-colors
                    flex items-center justify-between"
                  >
                    <span>
                      {selectedRanks.length > 0 ? selectedRanks.join(", ") : "Select Ranks"}
                    </span>

                    <svg width="20" height="20" fill="none" stroke="currentColor" className="ml-2 text-muted-foreground">
                      <path d="M6 8l4 4 4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </PopoverTrigger>
                  <PopoverContent className="bg-[#0F172A] border-border p-2">
                    {ranks.map((rank) => (
                      <div key={rank} className="flex items-center gap-2 py-1">
                        <Checkbox 
                          checked={selectedRanks.includes(rank)}
                          onCheckedChange={() => handleRankChange(rank)}
                        />

                        <span>{rank}</span>
                      </div>
                    ))}
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Server
                </label>
                <Select value={selectedServer} onValueChange={setSelectedServer}>
                  <SelectTrigger className="bg-input/50 border-border focus:border-primary transition-colors">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0F172A] border-border">
                    {servers.map((server) => (
                      <SelectItem key={server} value={server}>
                        {server}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="card-glass rounded-xl p-6 space-y-6">
            <div className="flex items-center space-x-3 mb-4">
              <Clock className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-bold text-card-foreground">Preferências</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Idade: {ageRange[0]}+
                </label>
                <Slider
                  value={ageRange}
                  onValueChange={setAgeRange}
                  max={99}
                  min={16}
                  step={1}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Preferred Play Time
                </label>
                <Select value={playTime} onValueChange={setPlayTime}>
                  <SelectTrigger className="bg-input/50 border-border focus:border-primary transition-colors">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0F172A] border-border">
                    <SelectItem value="morning">Manhã (6AM - 12PM)</SelectItem>
                    <SelectItem value="afternoon">Tarde (12PM - 6PM)</SelectItem>
                    <SelectItem value="evening">Noite (6PM - 12AM)</SelectItem>
                    <SelectItem value="night">Madrugada (12AM - 6AM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tags */}
        {/* <div className="card-glass rounded-xl p-6 mb-12">
          <div className="flex items-center space-x-3 mb-4">
            <Users className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-bold text-card-foreground">Match Preferences</h3>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {filters.map((filter, index) => (
              <Badge
                key={index}
                variant={filter.active ? "default" : "outline"}
                className={`
                  px-4 py-2 cursor-pointer transition-all duration-300
                  ${filter.active 
                    ? 'bg-primary text-primary-foreground shadow-glow-primary' 
                    : 'text-muted-foreground hover:text-primary hover:border-primary/50'
                  }
                `}
              >
                {filter.label}
              </Badge>
            ))}
          </div>
        </div> */}

        {/* Action Buttons */}
        <div className="flex justify-center space-x-6">
          <Button
            variant="outline"
            className="px-8 py-3 text-muted-foreground border-border hover:border-primary/50 hover:text-primary transition-all duration-300"
            onClick={onBack}
          >
            Back
          </Button>
          <Button
            onClick={onNext}
            className="bg-gradient-primary hover:shadow-glow-primary text-primary-foreground px-12 py-3 font-semibold rounded-xl transition-all duration-300 hover:scale-105"
          >
            Buscar Duo
          </Button>
        </div>
      </div>
    </div>
  );
};