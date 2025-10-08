import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import React from "react";
import { useFeedServerContext } from "../context/FeedServerContext";
import { getAlertActionMessage } from "@/app/utils/getAlertActionMessage";

function ContextMenuAction({
  alertAction,
  confirmAction,
  alertOpen,
  setAlertOpen,
}) {
  const { Feed } = useFeedServerContext();
  const titles = Feed.ContextMenuAction.titles;
  return (
    <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
      <AlertDialogContent className="bg-background/95 backdrop-blur-xl border border-border/50">
        <AlertDialogHeader>
          {titles.confirm}
          <AlertDialogDescription>
            {getAlertActionMessage(alertAction)}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {titles.cancel}
          <AlertDialogAction
            onClick={confirmAction}
            className="bg-gradient-primary text-white"
          >
            Confirmar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default ContextMenuAction;
