import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { PostsCommentsProps } from "@/services/getComments";
import { LoadingComponent } from "@/components/layouts/components/LoadingComponent";
import TextLimitComponent from "@/components/layouts/SuspenseFallBack/TextLimitComponent/TextLimitComponent";

interface DeleteCommentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  comment: PostsCommentsProps;
  isDeleting: boolean;
}

export function DeleteCommentModal({
  open,
  onOpenChange,
  onConfirm,
  comment,
  isDeleting,
}: DeleteCommentModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-background/95 backdrop-blur-xl border border-border/50">
        <VisuallyHidden>
          <DialogTitle>Excluir comentário</DialogTitle>
        </VisuallyHidden>
        <div className="space-y-4">
          {/* Header */}
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-foreground">
              Excluir comentário
            </h2>
            <p className="text-sm text-muted-foreground">
              Essa ação não poderá ser desfeita.
            </p>
          </div>

          {/* Comment Preview */}
          <Card className="bg-muted/30 border-border/50">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center space-x-3">
                <Avatar className="w-9 h-9">
                  <AvatarFallback className="bg-gradient-primary text-white text-sm">
                    {comment?.user_username.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <p className="text-sm font-medium">
                    {comment?.user_username}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    @{comment?.user_username}
                  </p>
                </div>
              </div>

              <TextLimitComponent
                maxCharacters={150}
                text={comment?.comment}
                className="text-sm text-foreground"
              >
                {comment?.comment}
              </TextLimitComponent>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t border-border/50">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            {isDeleting ? (
              <Button variant="destructive" onClick={onConfirm}>
                <LoadingComponent
                  text="Excluindo comentário..."
                  showText={true}
                  className="!w-5 !h-5"
                />
              </Button>
            ) : (
              <Button variant="destructive" onClick={onConfirm}>
                Excluir comentário
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
