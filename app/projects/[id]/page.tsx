"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getProjectById } from "@/services/projects.service";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const [project, setProject] = useState<any>(null);

  useEffect(() => {
    if (!id) return;

    getProjectById(id as string).then((res) =>
      setProject(res.data)
    );
  }, [id]);

  if (!project) return <div>Loading...</div>;

  return (
    <div className="space-y-6">

      <h1 className="text-2xl font-semibold">
        {project.name}
      </h1>

      <p>{project.location}</p>
      <p>{project.priceRange}</p>

      <p><b>Vendor:</b> {project.vendorId?.name}</p>
      <p><b>Category:</b> {project.categoryId?.name}</p>

      <p>{project.fullDescription}</p>

      {/* AMENITIES */}
      <div>
        <h3>Amenities</h3>
        {project.amenities?.map((a: string) => (
          <span key={a} className="tag">{a}</span>
        ))}
      </div>

      {/* GALLERY */}
      <div className="flex gap-2 flex-wrap">
        {project.gallery?.map((img: string) => (
          <img key={img} src={img} className="w-20 h-20" />
        ))}
      </div>
    </div>
  );
}