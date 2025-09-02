import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send } from "lucide-react";

interface ReplyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  comment: {
    id: string;
    user: {
      name: string;
      username: string;
      avatar: string;
    };
    content: string;
    timestamp: string;
    likes: number;
  } | null;
  onSubmitReply: (content: string) => void;
}

export const ReplyModal = ({ open, onOpenChange, comment, onSubmitReply }: ReplyModalProps) => {
  const [replyContent, setReplyContent] = useState("");

  const handleSubmit = () => {
    if (replyContent.trim()) {
      onSubmitReply(replyContent);
      setReplyContent("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full bg-background/95 backdrop-blur-xl border border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Responder comentário</DialogTitle>
        </DialogHeader>
        
        {comment && (
          <div className="space-y-4">
            {/* Original Comment */}
            <div className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg">
              <Avatar className="w-8 h-8">
                <AvatarImage src={comment.user.avatar} alt={comment.user.name} />
                <AvatarFallback className="bg-gradient-primary text-white text-xs">
                  {comment.user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-sm">{comment.user.name}</span>
                  <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                </div>
                <p className="text-sm text-muted-foreground">{comment.content}</p>
              </div>
            </div>
            
            {/* Reply Input */}
            <div className="space-y-3">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Escreva sua resposta..."
                className="min-h-[100px] bg-muted/20 border-border/50 resize-none"
              />
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!replyContent.trim()}
                  className="bg-gradient-primary hover:shadow-glow-primary/30"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Responder
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};