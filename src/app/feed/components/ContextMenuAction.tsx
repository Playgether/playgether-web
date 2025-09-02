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
            {/* {alertAction === "delete" &&
              "Tem certeza que deseja deletar este post?"}
            {alertAction === "pin" &&
              "Tem certeza que deseja fixar este post no seu perfil?"}
            {alertAction === "block" &&
              "Tem certeza que deseja bloquear este usuário?"}
            {alertAction === "remove" &&
              "Tem certeza que deseja remover este post do seu feed?"}
            {alertAction === "mute" &&
              "Tem certeza que deseja silenciar este usuário?"} */}
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
