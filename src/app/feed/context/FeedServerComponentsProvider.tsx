import {
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Heart,
  MessageCircle,
  Play,
  Plus,
  Send,
  Share2,
  UserX,
  VolumeX,
} from "lucide-react";
import { FeedServerProvider } from "./FeedServerContext";
import LeftColumn from "../components/LeftColumn";
import RightColumn from "../components/RightColumn";
import VerifiedProfile from "@/components/elements/VerifiedProfile";
import MoreOptions from "../components/MoreOptions";
import ContextualMenu from "../components/ContextualMenu";
import NoImageProfile from "@/components/general/NoImageProfile";
import MoreMediasParagraph from "../components/MoreMediasParagraph";
import ShareModalHeader from "../components/ShareModalHeader";
import MediaSelectedButtonsImage from "../components/MediaSelectedButtonsImage";
import MediaSelectedButtonsVideo from "../components/MediaSelectedButtonsVideo";
import { Button } from "@/components/ui/button";
import ButtonCommentPostModal from "../components/ButtonCommentPostModal";
import {
  AlertDialogCancel,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MdOutlineSubdirectoryArrowRight } from "react-icons/md";

export const FeedServerComponents = {
  ContextMenuAction: {
    titles: {
      confirm: <AlertDialogTitle>Confirmar ação</AlertDialogTitle>,
      cancel: <AlertDialogCancel>Cancelar</AlertDialogCancel>,
    },
  },
  ServerPostModal: {
    icons: {
      Play: <Play className="w-16 h-16 text-white/80" />,
      ChevronLeft: <ChevronLeft className="w-6 h-6" />,
      EyeOff: <EyeOff className="w-4 h-4 mr-2" />,
      Eye: <Eye className="w-4 h-4 mr-2" />,
      MessageCircle: <MessageCircle className="w-5 h-5 mr-2" />,
      Share2: <Share2 className="w-5 h-5 mr-2" />,
      Heart: <Heart className="w-3 h-3 mr-1" />,
      Send: <Send className="w-4 h-4" />,
      ChevronRight: <ChevronRight className="w-6 h-6" />,
      ArrowRight: <MdOutlineSubdirectoryArrowRight className="w-4 h-4 mr-2 " />,
    },
    text: {
      verified: (
        <div className="w-5 h-5 bg-gradient-primary rounded-full flex items-center justify-center">
          <span className="text-white text-xs">✓</span>
        </div>
      ),
      comments: (
        <div className="p-4">
          <h4 className="font-semibold mb-4">Comentários</h4>
        </div>
      ),
    },
    buttons: {
      answer: (
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground hover:text-primary p-2 h-auto"
        >
          Responder
        </Button>
      ),
      comment: <ButtonCommentPostModal />,
    },
  },
  ServerShareModal: {
    components: {
      ShareModalHeader: <ShareModalHeader />,
    },
    buttons: {
      MediaSelectedButtonImage: <MediaSelectedButtonsImage />,
      MediaSelectedButtonsVideo: <MediaSelectedButtonsVideo />,
    },
    icons: {
      Send: <Send className="w-4 h-4 mr-2" />,
    },
  },
  ServerFeedPage: {
    icons: {
      Plus: <Plus className="w-6 h-6 mr-3" />,
    },
    components: {
      LeftColumn: <LeftColumn />,
      RightColumn: <RightColumn />,
    },
  },
  ServerFeedPost: {
    icons: {
      Share: <Share2 className="w-4 h-4" />,
      MessageCircle: <MessageCircle className="w-5 h-5" />,
      Share2: <Share2 className="w-5 h-5" />,
    },
    components: {
      VerifiedProfile: <VerifiedProfile />,
      MoreOptions: <MoreOptions />,
      NoImageProfile: <NoImageProfile />,
      NoImageReplieProfile: <NoImageProfile className="h-10 w-10" />,
      MoreMediasParagraph: <MoreMediasParagraph />,
    },
  },
  ServerContextMenuOwn: {
    components: {
      Delete: (
        <ContextualMenu
          text="Deletar post"
          icon={<UserX className="w-4 h-4" />}
        />
      ),
      Pin: (
        <ContextualMenu
          text="Fixar no perfil"
          icon={<EyeOff className="w-4 h-4" />}
        />
      ),
      Block: (
        <ContextualMenu
          text="Bloquear usuário"
          icon={<UserX className="w-4 h-4" />}
        />
      ),
      Remove: (
        <ContextualMenu
          text="Remover do feed"
          icon={<EyeOff className="w-4 h-4" />}
        />
      ),
      MuteUser: (
        <ContextualMenu
          text="Silenciar usuário"
          icon={<VolumeX className="w-4 h-4" />}
        />
      ),
    },
  },
} as const;

export default function FeedServerComponentsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FeedServerProvider components={FeedServerComponents}>
      {children}
    </FeedServerProvider>
  );
}
