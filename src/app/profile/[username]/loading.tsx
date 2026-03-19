import LoadingPages from "@/components/elements/LoadingPages/LoadingPages";

export default function LoadingProfile({ params }: { params?: { username?: string } }) {
  const username = params?.username ?? "";
  const normalized = username
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

  const tabSlugs = new Set([
    "bio",
    "midias",
    "textos",
    "estatisticas",
    "marcos",
    "conquistas",
    "biblioteca",
  ]);

  // Quando o "username" na verdade é um slug de aba, não precisamos mostrar loader,
  // porque a página não deve recarregar os dados completos.
  if (tabSlugs.has(normalized)) return null;

  return <LoadingPages message="O perfil está sendo carregado" />;
}
