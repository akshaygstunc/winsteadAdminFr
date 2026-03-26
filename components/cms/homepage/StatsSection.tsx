"use client";

export default function StatsSection() {
  return (
    <div className="card">
      <h2 className="section-title">Stats Section</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <input placeholder="Projects" className="input" />
        <input placeholder="Vendors" className="input" />
        <input placeholder="Clients" className="input" />
        <input placeholder="Cities" className="input" />
      </div>

      <button className="btn-primary mt-4">Save Stats</button>
    </div>
  );
}