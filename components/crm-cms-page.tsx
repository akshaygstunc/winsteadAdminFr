"use client";

import { useEffect, useMemo, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { Header } from "@/components/header";
import { Modal } from "@/components/modal";
import { ActionButton, SectionCard, StatusBadge } from "@/components/ui";
import { api } from "@/lib/api";
import { CmsConfig, CmsField, CmsItem } from "@/lib/cms";
import {
  FieldLabel,
  FormActions,
  FormGrid,
  SectionNotice,
  SelectInput,
  TextArea,
  TextInput,
} from "@/components/crud-kit";

function blankFromConfig(config: CmsConfig): CmsItem {
  const data: Record<string, any> = {};
  for (const field of config.fields) {
    if (
      [
        "title",
        "subtitle",
        "slug",
        "status",
        "image",
        "description",
        "sortOrder",
      ].includes(field.key)
    )
      continue;
    data[field.key] =
      field.type === "boolean"
        ? false
        : field.type === "number"
          ? 0
          : field.type === "multiselect"
            ? []
            : "";
  }
  return {
    title: "",
    subtitle: "",
    slug: "",
    status: "draft",
    image: "",
    description: "",
    sortOrder: 0,
    data,
  };
}
function getValue(item: CmsItem, field: CmsField) {
  if (field.key in item) return (item as any)[field.key];
  return (
    item.data?.[field.key] ??
    (field.type === "multiselect"
      ? []
      : field.type === "boolean"
        ? false
        : field.type === "number"
          ? 0
          : "")
  );
}
function setValue(item: CmsItem, field: CmsField, value: any): CmsItem {
  if (
    field.key in item ||
    [
      "title",
      "subtitle",
      "slug",
      "status",
      "image",
      "description",
      "sortOrder",
    ].includes(field.key)
  )
    return { ...item, [field.key]: value };
  return { ...item, data: { ...(item.data || {}), [field.key]: value } };
}
async function fileToDataUrl(file: File) {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
const iconOptions = [
  "building-2",
  "map-pin",
  "star",
  "badge-dollar-sign",
  "home",
  "briefcase-business",
  "users",
  "images",
];
function renderField(
  field: CmsField,
  value: any,
  onChange: (value: any) => void,
) {
  if (field.type === "textarea")
    return (
      <TextArea label={field.label} value={value || ""} onChange={onChange} />
    );
  if (field.type === "select")
    return (
      <SelectInput
        label={field.label}
        value={value || ""}
        onChange={onChange}
        options={field.options || []}
      />
    );
  if (field.type === "number")
    return (
      <TextInput
        label={field.label}
        value={value ?? 0}
        type="number"
        onChange={(v) => onChange(Number(v))}
      />
    );
  if (field.type === "date")
    return (
      <TextInput
        label={field.label}
        value={value || ""}
        type="date"
        onChange={onChange}
      />
    );
  if (field.type === "boolean")
    return (
      <label className="flex items-center gap-3 rounded-2xl border border-line bg-panel px-4 py-3 text-sm text-text">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span>{field.label}</span>
      </label>
    );
  if (field.type === "multiselect") {
    const selected = Array.isArray(value) ? value : [];
    return (
      <div>
        <FieldLabel label={field.label} />
        <div className="grid gap-2 sm:grid-cols-2">
          {(field.options || []).map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2 rounded-2xl border border-line bg-panel px-3 py-2 text-sm text-text"
            >
              <input
                type="checkbox"
                checked={selected.includes(opt.value)}
                onChange={(e) =>
                  onChange(
                    e.target.checked
                      ? [...selected, opt.value]
                      : selected.filter((v: string) => v !== opt.value),
                  )
                }
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
        {field.note ? (
          <p className="mt-2 text-xs text-muted">{field.note}</p>
        ) : null}
      </div>
    );
  }
  if (field.type === "icon") {
    return (
      <div>
        <FieldLabel label={field.label} />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {iconOptions.map((icon) => (
            <button
              key={icon}
              type="button"
              onClick={() => onChange(icon)}
              className={`rounded-2xl border px-3 py-3 text-sm ${value === icon ? "border-gold bg-gold/10 text-gold" : "border-line bg-panel text-text"}`}
            >
              {icon}
            </button>
          ))}
        </div>
        {field.note ? (
          <p className="mt-2 text-xs text-muted">{field.note}</p>
        ) : null}
      </div>
    );
  }
  if (field.type === "image" || field.type === "video") {
    const accept = field.type === "video" ? "video/mp4" : "image/*";
    return (
      <div className="space-y-3">
        <TextInput
          label={field.label}
          value={value || ""}
          onChange={onChange}
          placeholder={
            field.type === "video"
              ? "Paste MP4 URL or upload below"
              : "Paste image URL or upload below"
          }
        />
        <div>
          <FieldLabel label={`${field.label} Upload`} />
          <input
            className="input"
            type="file"
            accept={accept}
            onChange={async (e: any) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const formData = new FormData()
              formData.append('file', file);
              const data = await api.post<any[]>(
                `/content/upload/gallery`,
                formData,

              );
              const dataUrl = data?.data?.url;
              onChange(dataUrl);
            }}
          />
        </div>
        {field.note ? <p className="text-xs text-muted">{field.note}</p> : null}
        {value ? (
          field.type === "video" ? (
            <video
              src={value}
              controls
              className="h-40 w-full rounded-2xl border border-line object-cover"
            />
          ) : (
            <img
              src={value}
              alt={field.label}
              className="h-40 w-full rounded-2xl border border-line object-cover"
            />
          )
        ) : null}
      </div>
    );
  }
  return (
    <div>
      {field.note ? (
        <>
          <TextInput
            label={field.label}
            value={value || ""}
            onChange={onChange}
          />
          <p className="mt-2 text-xs text-muted">{field.note}</p>
        </>
      ) : (
        <TextInput
          label={field.label}
          value={value || ""}
          onChange={onChange}
        />
      )}
    </div>
  );
}
function metricLabel(kind: CmsConfig["routeKind"]) {
  if (kind === "sales") return ["Total Pipeline", "Closed Value", "Follow-ups"];
  if (kind === "clients") return ["Clients", "VIP", "Active RMs"];
  return ["Managers", "Visible on Site", "Markets"];
}
export function CrmCmsPage({ config }: { config: CmsConfig }) {
  const [items, setItems] = useState<CmsItem[]>([]);
  const [form, setForm] = useState<CmsItem>(blankFromConfig(config));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = async (term = "") => {
    try {
      const rows = await api.get<CmsItem[]>(
        `/content/${config.entity}${term ? `?search=${encodeURIComponent(term)}` : ""}`,
      );
      setItems(rows);
    } catch {
      setError("Failed to load records.");
    }
  };
  useEffect(() => {
    load();
  }, [config.entity]);
  const reset = () => {
    setEditingId(null);
    setForm(blankFromConfig(config));
    setOpen(false);
  };
  const edit = (item: CmsItem) => {
    setEditingId(item._id || null);
    setForm({
      ...blankFromConfig(config),
      ...item,
      data: { ...blankFromConfig(config).data, ...(item.data || {}) },
    });
    setOpen(true);
  };
  const submit = async () => {
    try {
      const payload = {
        ...form,
        slug:
          form.slug ||
          form.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, ""),
      };
      if (editingId)
        await api.patch(`/content/${config.entity}/${editingId}`, payload);
      else await api.post(`/content/${config.entity}`, payload);
      setMessage(editingId ? "Updated successfully." : "Created successfully.");
      reset();
      await load(search);
    } catch {
      setError("Unable to save record.");
    }
  };
  const remove = async (id?: string) => {
    if (!id) return;
    try {
      await api.delete(`/content/${config.entity}/${id}`);
      setMessage("Deleted successfully.");
      await load(search);
    } catch {
      setError("Unable to delete record.");
    }
  };
  const labels = metricLabel(config.routeKind);
  const metrics = useMemo(() => {
    if (config.routeKind === "sales") {
      const total = items.reduce(
        (sum, i) => sum + Number(i.data?.dealValue || 0),
        0,
      );
      const closed = items
        .filter((i) => i.status === "closed")
        .reduce((sum, i) => sum + Number(i.data?.dealValue || 0), 0);
      const follow = items.filter((i) => i.data?.followUpDate).length;
      return [
        String(items.length),
        `AED ${closed.toLocaleString()}`,
        String(follow),
      ];
    }
    if (config.routeKind === "clients") {
      return [
        String(items.length),
        String(items.filter((i) => i.status === "vip").length),
        String(
          new Set(items.map((i) => i.data?.assignedRm).filter(Boolean)).size,
        ),
      ];
    }
    const visible = items.filter((i) =>
      Boolean(i.data?.visibleOnWebsite),
    ).length;
    const markets = new Set(
      items.flatMap((i) =>
        Array.isArray(i.data?.locations) ? i.data.locations : [],
      ),
    ).size;
    return [String(items.length), String(visible), String(markets)];
  }, [items, config.routeKind]);
  const featuredFields =
    config.routeKind === "sales"
      ? ["clientName", "unitName", "dealValue", "owner", "followUpDate"]
      : config.routeKind === "clients"
        ? ["email", "phone", "city", "assignedRm", "budget"]
        : ["phone", "email", "languages", "locations", "specialization"];
  return (
    <DashboardShell>
      <Header title={config.title} subtitle={config.subtitle} />
      <div className="space-y-6">
        <SectionNotice message={message} error={error} />
        <div className="grid gap-4 md:grid-cols-3">
          {labels.map((label, idx) => (
            <SectionCard key={label} title={metrics[idx]} subtitle={label} />
          ))}
        </div>
        <SectionCard
          title={`${config.title} Workspace`}
          subtitle="Custom CRM layout with richer cards, quick actions, and dedicated edit flow."
          action={
            <div className="flex flex-wrap gap-3">
              <input
                className="input w-72"
                placeholder={config.searchPlaceholder || "Search"}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") load(search);
                }}
              />
              <ActionButton secondary onClick={() => load(search)}>
                Search
              </ActionButton>
              <ActionButton onClick={() => setOpen(true)}>
                {config.addLabel || "Add New"}
              </ActionButton>
            </div>
          }
        >
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item._id || item.title}
                className="rounded-[28px] border border-line bg-panel/70 p-5"
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="flex gap-4">
                    <div className="h-20 w-20 overflow-hidden rounded-[22px] border border-line bg-card">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-violet-500/15 to-gold/10" />
                      )}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-text">
                          {item.title}
                        </h3>
                        <StatusBadge
                          value={item.status || "draft"}
                          tone={
                            item.status === "active" ||
                              item.status === "closed" ||
                              item.status === "vip"
                              ? "green"
                              : "gold"
                          }
                        />
                      </div>
                      {item.subtitle ? (
                        <p className="mt-1 text-sm text-muted">
                          {item.subtitle}
                        </p>
                      ) : null}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {config.routeKind === "clients"
                          ? [
                            "Recommended Properties",
                            "Add Document",
                            "Seen Properties",
                            "Notifications",
                          ].map((a) => (
                            <span
                              key={a}
                              className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs text-gold"
                            >
                              {a}
                            </span>
                          ))
                          : null}
                        {config.routeKind === "sales"
                          ? ["Print", "Export", "Create Follow-up"].map((a) => (
                            <span
                              key={a}
                              className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs text-gold"
                            >
                              {a}
                            </span>
                          ))
                          : null}
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 xl:min-w-[420px]">
                    {featuredFields.map((key) => {
                      const field = config.fields.find((f) => f.key === key);
                      const val = field ? getValue(item, field) : "";
                      if (
                        val === "" ||
                        val == null ||
                        (Array.isArray(val) && !val.length)
                      )
                        return null;
                      return (
                        <div
                          key={key}
                          className="rounded-2xl border border-line bg-card/70 px-3 py-2 text-sm text-muted"
                        >
                          <span className="text-gold">
                            {field?.label || key}:
                          </span>{" "}
                          {Array.isArray(val) ? val.join(", ") : String(val)}
                        </div>
                      );
                    })}
                  </div>
                </div>
                {item.description ? (
                  <p className="mt-4 text-sm leading-6 text-muted">
                    {item.description}
                  </p>
                ) : null}
                <div className="mt-4 flex justify-end gap-2">
                  <ActionButton secondary onClick={() => edit(item)}>
                    Edit
                  </ActionButton>
                  <ActionButton secondary onClick={() => remove(item._id)}>
                    Delete
                  </ActionButton>
                </div>
              </div>
            ))}
            {!items.length ? (
              <div className="rounded-3xl border border-dashed border-line p-8 text-sm text-muted">
                No records found.
              </div>
            ) : null}
          </div>
        </SectionCard>
        <Modal
          open={open}
          onClose={reset}
          title={
            editingId
              ? `Edit ${config.title}`
              : config.addLabel || `Add ${config.title}`
          }
          subtitle="Dedicated CRM form flow with richer relation-style fields."
          size="xl"
        >
          <div className="space-y-5">
            <FormGrid columns={2}>
              {config.fields.map((field) => (
                <div
                  key={field.key}
                  className={
                    field.type === "textarea" ||
                      field.type === "image" ||
                      field.type === "video" ||
                      field.type === "multiselect"
                      ? "md:col-span-2"
                      : ""
                  }
                >
                  {renderField(field, getValue(form, field), (value) =>
                    setForm((prev) => setValue(prev, field, value)),
                  )}
                </div>
              ))}
            </FormGrid>
            <FormActions
              onSubmit={submit}
              onCancel={reset}
              submitLabel={editingId ? "Update Record" : "Create Record"}
            />
          </div>
        </Modal>
      </div>
    </DashboardShell>
  );
}
