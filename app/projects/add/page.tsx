"use client";

import ProjectFormModal from "@/components/projects/ProjectFormModal";
import { useRouter } from "next/navigation";

export default function AddProjectPage() {
  const router = useRouter();

  return (
    <ProjectFormModal onClose={() => router.push("/projects")} />
  );
}