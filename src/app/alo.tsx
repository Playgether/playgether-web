export default function Home() {
  return (
    <div className="h-screen flex flex-col">
      <div className="flex flex-1">
        <aside className="w-72 bg-zinc-950 p-6">
          <nav className="space-y-5">
            <a
              href=""
              className="flex items-center gap-3 text-sm font-semibold text-zinc-200"
            >
              icon Home
            </a>
            <a
              href=""
              className="flex items-center gap-3 text-sm font-semibold text-zinc-200"
            >
              icon Search
            </a>
            <a
              href=""
              className="flex items-center gap-3 text-sm font-semibold text-zinc-200"
            >
              icon Your Library
            </a>
          </nav>
        </aside>
        <main className="flex-1 p-6">main</main>
      </div>
      <footer className="bg-zinc-800 border-t border-zinc-700 px-6 p-6">
        foooter
        <p className="text-9xl">The quick brown fox ...</p>
      </footer>
    </div>
  );
}
