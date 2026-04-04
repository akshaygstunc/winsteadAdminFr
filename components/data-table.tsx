import { ReactNode } from 'react';

export function DataTable({
  headers,
  children,
}: {
  headers: string[];
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-line bg-card/70">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white/[0.03]">
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.24em] text-gold"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );
}
