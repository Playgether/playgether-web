"use client";

import { motion } from "framer-motion";
import { ConquistText } from "../ConquistText";
import { achievements } from "../constants";
import type { AchievementType } from "../modals/AchievementModal";

interface AchievementsTabProps {
  onAchievementClick: (achievement: AchievementType) => void;
}

export function AchievementsTab({ onAchievementClick }: AchievementsTabProps) {
  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.07 } },
      }}
    >
      {achievements.map((achievement) => (
        <motion.div
          key={achievement.id}
          variants={{
            hidden: { opacity: 0, y: 14 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.35, ease: "easeOut" },
            },
          }}
        >
          <ConquistText
            title={achievement.title}
            text={achievement.description}
            date={achievement.date}
            Icon={<span className="text-xl">{achievement.icon}</span>}
            rarity={achievement.rarity}
            recentlyUnlocked={achievement.recentlyUnlocked}
            onCardClick={() => onAchievementClick(achievement)}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
