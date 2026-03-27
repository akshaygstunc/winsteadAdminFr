"use client";

import { useEffect, useState } from "react";
import axios from "@/utils/axios";

export default function ProjectAnalytics() {
  const [data, setData] = useState<any>({});

  useEffect(() => {
    axios.get("/projects/analytics").then((res) => {
      setData(res.data);
    });
  }, []);

  return (
    <div className="grid grid-cols-4 gap-4">

      <div className="card">
        <p>Total Projects</p>
        <h2>{data.total || 0}</h2>
      </div>

      <div className="card">
        <p>Active</p>
        <h2>{data.active || 0}</h2>
      </div>

      <div className="card">
        <p>Featured</p>
        <h2>{data.featured || 0}</h2>
      </div>

    </div>
  );
}