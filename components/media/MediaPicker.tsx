"use client";

export default function MediaPicker({ onSelect }: any) {
  const mockImages = [
    "https://via.placeholder.com/100",
    "https://via.placeholder.com/101",
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {mockImages.map((img, i) => (
        <img
          key={i}
          src={img}
          onClick={() => onSelect(img)}
          className="cursor-pointer rounded-lg"
        />
      ))}
    </div>
  );
}