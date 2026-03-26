"use client";

import TestimonialsFormModal from "@/components/testimonials/TestimonialsFormModal";
import TestimonialsTable from "../../components/testimonials/TestimonialsTable";
import { useState } from "react";

export default function TestimonialsPage() {
  const [open, setOpen] = useState(false);

  return (
      <div className="space-y-6">

        <div className="flex justify-between">
          <h1 className="text-2xl">Testimonials</h1>

          <button className="btn-primary" onClick={() => setOpen(true)}>
            Add Testimonial
          </button>
        </div>

        <TestimonialsTable />

        {open && <TestimonialsFormModal onClose={() => setOpen(false)} />}
      </div>
  );
}