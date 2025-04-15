import { validadeRoom } from "@/services/validateRoom";
import { redirect } from "next/navigation";

export async function GET(
    req: Request,
    { params }: { params: { name: string } }
  ) {
    const roomName = params.name;
    const res = await validadeRoom(roomName);
  
    if (!res.ok) {
      const error = res.error;
  
      // Se a resposta do backend tiver um "error" descritivo, use isso
      if (typeof error === "object" && error.data?.error) {
        return new Response(error.data.error, { status: error.status || 400 });
      }
  
      return new Response("Erro ao validar a sala", { status: 400 });
    }

    if (!res.response) {
      return new Response("Erro ao validar a sala", { status: 400 });
    }
    
    const data = res.response.data;
  
    if (data.ok) {
      return redirect(`/rooms/${roomName}`);
    } else {
      return new Response(data.error || "Sala inválida", { status: 400 });
    }
  }