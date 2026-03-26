"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FaGripVertical } from "react-icons/fa";

export default function SortableItem({ id, name }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between bg-[#0f0f0f] p-3 rounded-lg border border-[#1A1A1A]"
    >
      <div className="flex items-center gap-3">
        <span {...attributes} {...listeners} className="cursor-grab">
          <FaGripVertical />
        </span>
        <span>{name}</span>
      </div>
    </div>
  );
}