// "use client";

// import { useEffect, useState } from "react";
// import { useParams } from "next/navigation";
// import { getProjectById } from "@/services/projects.service";

// export default function ProjectDetailPage() {
//   const { id } = useParams();
//   const [project, setProject] = useState<any>(null);

//   useEffect(() => {
//     if (!id) return;

//     getProjectById(id as string).then((res) =>
//       setProject(res.data)
//     );
//   }, [id]);

//   if (!project) return <div>Loading...</div>;

//   return (
//     <div className="space-y-6">

//       <h1 className="text-2xl font-semibold">
//         {project.name}
//       </h1>

//       <p>{project.location}</p>
//       <p>{project.priceRange}</p>

//       <p><b>Vendor:</b> {project.vendorId?.name}</p>
//       <p><b>Category:</b> {project.categoryId?.name}</p>

//       <p>{project.fullDescription}</p>

//       {/* AMENITIES */}
//       <div>
//         <h3>Amenities</h3>
//         {project.amenities?.map((a: string) => (
//           <span key={a} className="tag">{a}</span>
//         ))}
//       </div>

//       {/* GALLERY */}
//       <div className="flex gap-2 flex-wrap">
//         {project.gallery?.map((img: string) => (
//           <img key={img} src={img} className="w-20 h-20" />
//         ))}
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getProjectById } from "@/services/projects.service";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    getProjectById(id as string)
      .then((res) => setProject(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!project) return <div>Project not found</div>;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <img
          src={project.gallery?.[0] || "/placeholder.png"}
          className="w-20 h-20 rounded-xl object-cover"
        />

        <div>
          <h1 className="text-2xl font-semibold">{project.name}</h1>

          <p className="text-gray-400 text-sm">{project.location}</p>
        </div>
      </div>

      {/* STATUS + FEATURED */}
      <div className="flex gap-4">
        <span
          className={`px-3 py-1 rounded-full text-xs ${
            project.status === "AVAILABLE"
              ? "bg-green-500/20 text-green-400"
              : "bg-yellow-500/20 text-yellow-400"
          }`}
        >
          {project.status}
        </span>

        <span className="px-3 py-1 rounded-full text-xs bg-[#C8A96A]/20 text-[#C8A96A]">
          {project.isFeatured ? "Featured" : "Not Featured"}
        </span>
      </div>

      {/* BASIC INFO */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card space-y-2">
          <h2 className="font-semibold">Project Info</h2>

          <p>
            <b>Name:</b> {project.name}
          </p>
          <p>
            <b>Location:</b> {project.location}
          </p>
          <p>
            <b>Price:</b> {project.priceRange}
          </p>
          <p>
            <b>Status:</b> {project.status}
          </p>
        </div>

        <div className="card space-y-2">
          <h2 className="font-semibold">Relations</h2>

          <p>
            <b>Vendor:</b> {project.vendorId?.name || "-"}
          </p>
          <p>
            <b>Category:</b> {project.categoryId?.name || "-"}
          </p>
        </div>
      </div>

      {/* DESCRIPTION */}
      <div className="card space-y-3">
        <h2 className="font-semibold">Description</h2>

        <p
          className="prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{
            __html: project.fullDescription || "",
          }}
        />

        <p
          dangerouslySetInnerHTML={{
            __html: project.fullDescription || "",
          }}
        />
      </div>

      {/* AMENITIES */}
      <div className="card">
        <h2 className="font-semibold mb-2">Amenities</h2>

        {/* <div className="flex flex-wrap gap-2">
          {project.amenities?.length ? (
            project.amenities.map((a: string) => (
              <span key={a} className="tag">
                {a}
              </span>
            ))
          ) : (
            <p className="text-gray-400">No amenities</p>
          )}
        </div> */}
        {project.amenities.map((a: any) => (
          <div
            key={a.title}
            className="flex items-center gap-3 border p-2 rounded-lg"
          >
            {/* ICON */}
            {a.icon && <img src={a.icon} className="w-6 h-6" />}

            <div>
              <p className="font-medium">{a.title}</p>
              <p
                className="text-xs text-gray-400 prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{
                  __html: a.description || "",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* TAGS */}
      <div className="card">
        <h2 className="font-semibold mb-2">Tags</h2>

        <div className="flex flex-wrap gap-2">
          {project.tags?.length ? (
            project.tags.map((t: string) => (
              <span key={t} className="tag">
                {t}
              </span>
            ))
          ) : (
            <p className="text-gray-400">No tags</p>
          )}
        </div>
      </div>

      {/* GALLERY */}
      <div className="card">
        <h2 className="font-semibold mb-3">Gallery</h2>

        <div className="flex gap-3 flex-wrap">
          {project.gallery?.length ? (
            project.gallery.map((img: string) => (
              <img
                key={img}
                src={img}
                className="w-24 h-24 rounded-lg object-cover"
              />
            ))
          ) : (
            <p className="text-gray-400">No images</p>
          )}
        </div>
      </div>

      {/* FILES */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* BROCHURE */}
        <div className="card">
          <h2 className="font-semibold mb-2">Brochure</h2>

          {project.brochure ? (
            <a
              href={project.brochure}
              target="_blank"
              className="text-[#C8A96A]"
            >
              View Brochure
            </a>
          ) : (
            <p className="text-gray-400">Not available</p>
          )}
        </div>

        {/* FLOOR PLAN */}
        <div className="card">
          <h2 className="font-semibold mb-2">Floor Plan</h2>

          {project.floorPlan ? (
            <img
              src={project.floorPlan}
              className="w-full h-40 object-cover rounded-lg"
            />
          ) : (
            <p className="text-gray-400">Not available</p>
          )}
        </div>
      </div>

      {/* META */}
      <div className="card space-y-2">
        <h2 className="font-semibold">Meta Info</h2>

        <p>
          <b>Created At:</b> {new Date(project.createdAt).toLocaleString()}
        </p>

        <p>
          <b>Updated At:</b> {new Date(project.updatedAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
