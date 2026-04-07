"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { Header } from "@/components/header";
import { Modal } from "@/components/modal";
import { ActionButton, SectionCard, StatusBadge } from "@/components/ui";
import { api } from "@/lib/api";
import { CmsConfig, CmsItem } from "@/lib/cms";
import {
  FormActions,
  SectionNotice,
  TextArea,
  TextInput,
} from "@/components/crud-kit";

type LocationForm = CmsItem & { data?: Record<string, any> };
const blank = (): LocationForm => ({
  title: "",
  status: "published",
  description: "",
  data: { city: "", subCityCount: 0, subCities: "" },
});

export function LocationsCmsPage({ config }: { config: CmsConfig }) {
  const [items, setItems] = useState<LocationForm[]>([]);
  const [form, setForm] = useState<LocationForm>(blank());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = async () => {
    try {
      setItems(await api.get<LocationForm[]>(`/content/${config.entity}`));
    } catch {
      setError("Failed to load locations.");
    }
  };
  useEffect(() => {
    load();
  }, [config.entity]);
  const edit = (item: LocationForm) => {
    setEditingId(item._id || null);
    setForm({
      ...blank(),
      ...item,
      data: { ...blank().data, ...(item.data || {}) },
    });
    setOpen(true);
  };
  const reset = () => {
    setEditingId(null);
    setForm(blank());
    setOpen(false);
  };
  const submit = async () => {
    const subCities = String(form.data?.subCities || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const payload = {
      ...form,
      subtitle: `${subCities.length} sub-cities`,
      data: { ...(form.data || {}), subCityCount: subCities.length, subCities },
    };
    try {
      if (editingId)
        await api.patch(`/content/${config.entity}/${editingId}`, payload);
      else await api.post(`/content/${config.entity}`, payload);
      setMessage(editingId ? "Location updated." : "Location created.");
      reset();
      await load();
    } catch {
      setError("Unable to save location.");
    }
  };
  const remove = async (id?: string) => {
    if (!id) return;
    try {
      await api.delete(`/content/${config.entity}/${id}`);
      setMessage("Location removed.");
      await load();
    } catch {
      setError("Unable to remove location.");
    }
  };
  return (
    <DashboardShell>
      <Header title={config.title} subtitle={config.subtitle} />
      <div className="space-y-6">
        <SectionNotice message={message} error={error} />
        <SectionCard
          title="Locations Master"
          subtitle="City cards with nested sub-city handling, closer to the source screens."
          action={
            <ActionButton onClick={() => setOpen(true)}>Add City</ActionButton>
          }
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => {
              const subs = Array.isArray(item.data?.subCities)
                ? item.data?.subCities
                : [];
              return (
                <article
                  key={item._id || item.title}
                  className="rounded-[28px] border border-line bg-panel/70 p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-text">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm text-muted">
                        {item.data?.city || item.title}
                      </p>
                    </div>
                    <StatusBadge
                      value={item.status || "active"}
                      tone={item.status === "active" ? "green" : "slate"}
                    />
                  </div>
                  <div className="mt-4 rounded-2xl border border-line bg-card/70 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.24em] text-gold">
                      Sub-cities
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-text">
                      {subs.length}
                    </p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {subs.slice(0, 4).map((sub: string) => (
                      <span
                        key={sub}
                        className="rounded-full border border-line px-3 py-1 text-xs text-muted"
                      >
                        {sub}
                      </span>
                    ))}
                    {subs.length > 4 ? (
                      <span className="rounded-full border border-line px-3 py-1 text-xs text-muted">
                        +{subs.length - 4} more
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-4 flex justify-end gap-2">
                    <ActionButton secondary onClick={() => edit(item)}>
                      Edit
                    </ActionButton>
                    <ActionButton secondary onClick={() => remove(item._id)}>
                      Delete
                    </ActionButton>
                  </div>
                </article>
              );
            })}
            {!items.length ? (
              <div className="rounded-3xl border border-dashed border-line p-8 text-sm text-muted">
                No location records found.
              </div>
            ) : null}
          </div>
        </SectionCard>
        <Modal
          open={open}
          onClose={reset}
          title={editingId ? "Edit City" : "Add City"}
          subtitle="Manage city-level records and comma-separated sub-cities."
          size="lg"
        >
          <div className="space-y-4">
            <TextInput
              label="City Name"
              value={form.title}
              onChange={(v) => setForm((prev) => ({ ...prev, title: v }))}
            />
            <TextInput
              label="City Display Name"
              value={String(form.data?.city || "")}
              onChange={(v) =>
                setForm((prev) => ({
                  ...prev,
                  data: { ...(prev.data || {}), city: v },
                }))
              }
            />
            <TextArea
              label="Sub Cities"
              value={
                Array.isArray(form.data?.subCities)
                  ? form.data?.subCities.join(", ")
                  : String(form.data?.subCities || "")
              }
              onChange={(v) =>
                setForm((prev) => ({
                  ...prev,
                  data: { ...(prev.data || {}), subCities: v },
                }))
              }
              rows={5}
            />
            <TextArea
              label="Description"
              value={form.description || ""}
              onChange={(v) => setForm((prev) => ({ ...prev, description: v }))}
              rows={4}
            />
            <FormActions
              onSubmit={submit}
              onCancel={reset}
              submitLabel={editingId ? "Update City" : "Create City"}
            />
          </div>
        </Modal>
      </div>
    </DashboardShell>
  );
}
