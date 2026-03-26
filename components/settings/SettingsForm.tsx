"use client";

import { useState } from "react";
import MediaPickerModal from "@/components/media/MediaPickerModal";

export default function SettingsForm() {
  const [logo, setLogo] = useState("");
  const [favicon, setFavicon] = useState("");
  const [open, setOpen] = useState("");

  return (
    <div className="card space-y-4">

      <input placeholder="Website Name" className="input" />

      {/* LOGO */}
      <button onClick={() => setOpen("logo")} className="input text-left">
        Select Logo
      </button>
      {logo && <img src={logo} className="w-20" />}

      {/* FAVICON */}
      <button onClick={() => setOpen("favicon")} className="input text-left">
        Select Favicon
      </button>
      {favicon && <img src={favicon} className="w-10" />}

      <input placeholder="Phone" className="input" />
      <input placeholder="Email" className="input" />
      <input placeholder="Address" className="input" />

      <input placeholder="Facebook" className="input" />
      <input placeholder="Instagram" className="input" />

      <button className="btn-primary">Save Settings</button>

      {open && (
        <MediaPickerModal
          onSelect={(img: string) => {
            if (open === "logo") setLogo(img);
            if (open === "favicon") setFavicon(img);
            setOpen("");
          }}
          onClose={() => setOpen("")}
        />
      )}
    </div>
  );
}