"use client";

export default function CTASection() {
  return (
    <div className="card">
      <h2 className="section-title">CTA Section</h2>

      <input placeholder="CTA Text" className="input" />
      <input placeholder="Button Text" className="input mt-3" />
      <input placeholder="Button Link" className="input mt-3" />

      <button className="btn-primary mt-4">Save CTA</button>
    </div>
  );
}