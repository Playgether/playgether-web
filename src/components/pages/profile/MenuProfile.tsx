import MenuOption from "./MenuOption";
import {
  User,
  Image as ImageIcon,
  FileText,
  TrendingUp,
  Trophy,
  Target,
  Gamepad2,
} from "lucide-react";

export const MenuProfile = ({
  setContent,
  content,
}: {
  setContent: (content: string) => void;
  content: string;
}) => {
  return (
    <div className="w-full mb-6">
      <ul className="flex flex-wrap justify-center lg:justify-start gap-1 bg-card border border-border p-1 h-auto overflow-visible rounded-xl shadow-card">
        <MenuOption
          text="bio"
          label="Bio"
          Icon={User}
          setContent={setContent}
          content={content}
        />
        <MenuOption
          text="medias"
          label="Mídias"
          Icon={ImageIcon}
          setContent={setContent}
          content={content}
        />
        <MenuOption
          text="textos"
          label="Textos"
          Icon={FileText}
          setContent={setContent}
          content={content}
        />
        <MenuOption
          text="estatisticas"
          label="Estatísticas"
          Icon={TrendingUp}
          setContent={setContent}
          content={content}
        />
        <MenuOption
          text="conquistas"
          label="Conquistas"
          Icon={Trophy}
          setContent={setContent}
          content={content}
        />
        <MenuOption
          text="marcos"
          label="Marcos"
          Icon={Target}
          setContent={setContent}
          content={content}
        />
        <MenuOption
          text="jogos"
          label="Jogos"
          Icon={Gamepad2}
          setContent={setContent}
          content={content}
        />
      </ul>
    </div>
  );
};
