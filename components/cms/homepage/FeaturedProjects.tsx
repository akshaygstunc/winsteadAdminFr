"use client";

import {
  DndContext,
  closestCenter,
} from "@dnd-kit/core";

import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { useState } from "react";
import SortableItem from "./SortableItem";

// MOCK PROJECT LIST (later from API)
const allProjects = [
  { id: "1", name: "Palm Residency" },
  { id: "2", name: "Skyline Towers" },
  { id: "3", name: "Elite Homes" },
  { id: "4", name: "Ocean Heights" },
];

export default function FeaturedProjects() {
  const [selected, setSelected] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);

  // ADD PROJECT
  const handleAdd = (project: any) => {
    if (!projects.find((p) => p.id === project.id)) {
      setProjects([...projects, project]);
    }
  };

  // REMOVE PROJECT
  const handleRemove = (id: string) => {
    setProjects(projects.filter((p) => p.id !== id));
  };

  // DRAG
  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = projects.findIndex((p) => p.id === active.id);
      const newIndex = projects.findIndex((p) => p.id === over.id);

      setProjects(arrayMove(projects, oldIndex, newIndex));
    }
  };

  return (
    <div className="card space-y-4">
      <h2 className="section-title">Featured Projects</h2>

      {/* SELECT PROJECT */}
      <select
        className="input"
        onChange={(e) => {
          const project = allProjects.find((p) => p.id === e.target.value);
          if (project) handleAdd(project);
        }}
      >
        <option>Select Project</option>
        {allProjects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      {/* SELECTED LIST (DRAGGABLE) */}
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={projects}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {projects.map((p) => (
              <div key={p.id} className="flex items-center justify-between">
                <SortableItem id={p.id} name={p.name} />

                <button
                  onClick={() => handleRemove(p.id)}
                  className="text-red-400 text-xs"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <button className="btn-primary">Save Featured Projects</button>
    </div>
  );
}