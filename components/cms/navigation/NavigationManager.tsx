"use client";

import { useState } from "react";

export default function NavigationManager() {
  const [menus, setMenus] = useState([
    { name: "Home", link: "/" },
    { name: "Projects", link: "/projects" },
  ]);

  const addMenu = () => {
    setMenus([...menus, { name: "", link: "" }]);
  };

  return (
    <div className="card space-y-4">

      {menus.map((m, i) => (
        <div key={i} className="grid grid-cols-2 gap-3">
          <input
            value={m.name}
            onChange={(e) => {
              const updated = [...menus];
              updated[i].name = e.target.value;
              setMenus(updated);
            }}
            placeholder="Menu Name"
            className="input"
          />

          <input
            value={m.link}
            onChange={(e) => {
              const updated = [...menus];
              updated[i].link = e.target.value;
              setMenus(updated);
            }}
            placeholder="Link"
            className="input"
          />
        </div>
      ))}

      <button onClick={addMenu} className="btn-primary">
        Add Menu
      </button>
    </div>
  );
}