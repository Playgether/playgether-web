import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ViewAllModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
}

export const ViewAllModal = ({ open, onOpenChange, title, items, renderItem }: ViewAllModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full h-[70vh] bg-background/95 backdrop-blur-xl border border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-3">
            {items.map((item, index) => renderItem(item, index))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};