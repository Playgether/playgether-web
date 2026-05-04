interface RoomPlaceholderPanelProps {
  title: string;
  description: string;
}

export default function RoomPlaceholderPanel({
  title,
  description,
}: RoomPlaceholderPanelProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 overflow-y-auto bg-muted/20 p-8 text-center">
      <p className="text-lg font-bold text-foreground">{title}</p>
      <p className="max-w-md text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
