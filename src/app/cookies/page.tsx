import { redirect } from "next/navigation";

export default function CookiesPage() {
  redirect("/terms?doc=cookies");
}
