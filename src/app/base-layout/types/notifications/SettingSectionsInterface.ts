export interface SettingSectionsInterface {
  darkMode: boolean;
  toggleDarkMode: () => void;
  notifications: boolean;
  setNotifications: (value: boolean) => void;
  soundEffects: boolean;
  setSoundEffects: (value: boolean) => void;
  autoPlay: boolean;
  setAutoPlay: (value: boolean) => void;
}
