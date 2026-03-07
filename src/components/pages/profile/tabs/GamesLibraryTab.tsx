"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { games } from "../constants";

export function GamesLibraryTab() {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-6">Biblioteca de Jogos</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map((game) => (
          <Card
            key={game.id}
            className="hover:shadow-card transition-all duration-200"
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={game.image}
                  alt={game.name}
                  className="w-12 h-12 rounded object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-semibold">{game.name}</h4>
                  {game.id === "valorant" ? (
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>✅ Conectado</div>
                      <div>Nick: RayJunior#BR1</div>
                      <div>ID: #BR1-2023</div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      ❌ Não conectado
                    </div>
                  )}
                </div>
              </div>

              {game.id === "valorant" ? (
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-2 bg-card/50 rounded">
                    <div className="font-semibold text-neon-blue">Diamond 2</div>
                    <div className="text-xs text-muted-foreground">Rank Atual</div>
                  </div>
                  <div className="p-2 bg-card/50 rounded">
                    <div className="font-semibold text-neon-green">1,247</div>
                    <div className="text-xs text-muted-foreground">RR</div>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full hover:bg-gradient-primary hover:text-white hover:border-transparent transition-all duration-200"
                >
                  Conectar Conta
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
