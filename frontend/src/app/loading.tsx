import { LoadingComponent } from "../components/layouts/components/LoadingComponent";

export default function LoadingHome() {
    return (
        <div className="flex gap-2 h-screen w-screen bg-orange-500 items-center justify-center text-xl">
            <p>Carregando...</p>
            <LoadingComponent className="h-8 w-8"/>
        </div>
    )
}