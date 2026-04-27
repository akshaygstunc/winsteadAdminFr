import { Bell, Search, Sparkles } from 'lucide-react';

export function Header({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-8 grid gap-4 xl:grid-cols-[1fr_320px]">
      <div className="card overflow-hidden">
        <div className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-text">{title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{subtitle}</p>
          </div>
          {/* <div className="flex gap-3">
            <div className="flex items-center gap-3 rounded-2xl border border-line bg-panel px-4 py-3 text-sm text-muted">
              <Search className="h-4 w-4 text-gold" />
              <span>Search modules...</span>
            </div>
            <button className="flex h-12 w-12 items-center justify-center rounded-2xl border border-line bg-panel text-muted">
              <Bell className="h-4 w-4" />
            </button>
          </div> */}
        </div>
      </div>

    </div>
  );
}
