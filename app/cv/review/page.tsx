"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  Loader2,
  Pencil,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { EXPERIENCE_LEVELS, WORK_PREFERENCES } from "@/lib/profile/fields";

type Profile = {
  full_name: string | null;
  location: string | null;
  experience: string | null;
  skills: string[];
  preferred_roles: string[];
  work_preference: string | null;
};

type ExtractedCvProfile = {
  fullName: string | null;
  location: string | null;
  experience: string | null;
  skills: string[];
  preferredRoles: string[];
  workPreference: string | null;
  education: string | null;
  currentRole: string | null;
};

type FieldKey =
  | "fullName"
  | "location"
  | "preferredRoles"
  | "experience"
  | "skills"
  | "workPreference";

type EditableValues = Record<FieldKey, string>;

type ReviewField = {
  key: FieldKey;
  label: string;
  kind: "text" | "select" | "list";
  options?: readonly string[];
  fallback: string;
};

type ReviewSection = {
  title: string;
  editable: boolean;
  fields: ReviewField[];
  details?: [string, string][];
};

const EMPTY_VALUES: EditableValues = {
  fullName: "",
  location: "",
  preferredRoles: "",
  experience: "",
  skills: "",
  workPreference: "",
};

const INPUT_CLASSNAME =
  "h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm transition placeholder:text-neutral-400 hover:border-neutral-300 outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-950/10 dark:focus:border-neutral-400 dark:focus:ring-white/10 dark:border-neutral-800 dark:bg-neutral-950";

const EDIT_BUTTON_CLASSNAME =
  "inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-white";

function joinList(values: string[]) {
  return values.join(", ");
}

function splitList(value: string) {
  const seen = new Set<string>();
  const items: string[] = [];

  for (const part of value.split(",")) {
    const item = part.trim().replace(/\s+/g, " ");

    if (!item) continue;

    const key = item.toLowerCase();

    if (seen.has(key)) continue;

    seen.add(key);
    items.push(item);
  }

  return items;
}

function dedupeList(...lists: string[][]) {
  const seen = new Set<string>();
  const items: string[] = [];

  for (const list of lists) {
    for (const value of list) {
      const item = value.trim();

      if (!item) continue;

      const key = item.toLowerCase();

      if (seen.has(key)) continue;

      seen.add(key);
      items.push(item);
    }
  }

  return items;
}

function toValues(profile: Profile): EditableValues {
  return {
    fullName: profile.full_name ?? "",
    location: profile.location ?? "",
    preferredRoles: joinList(profile.preferred_roles),
    experience: profile.experience ?? "",
    skills: joinList(profile.skills),
    workPreference: profile.work_preference ?? "",
  };
}

function mergeExtracted(
  current: EditableValues,
  existing: Profile,
  extracted: ExtractedCvProfile,
): EditableValues {
  const skills = dedupeList(existing.skills, extracted.skills);
  const roles = dedupeList(existing.preferred_roles, extracted.preferredRoles);

  return {
    fullName: extracted.fullName ?? current.fullName,
    location: extracted.location ?? current.location,
    preferredRoles: roles.length ? joinList(roles) : current.preferredRoles,
    experience: extracted.experience ?? current.experience,
    skills: skills.length ? joinList(skills) : current.skills,
    workPreference: extracted.workPreference ?? current.workPreference,
  };
}

export default function CVReviewPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [fileName, setFileName] = useState("Uploaded CV");
  const [values, setValues] = useState<EditableValues>(EMPTY_VALUES);
  const [extracted, setExtracted] = useState<ExtractedCvProfile | null>(null);
  const [editing, setEditing] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          router.replace("/login");
          return;
        }

        const { data, error: profileError } = await supabase
          .from("profiles")
          .select(
            "full_name, location, experience, skills, preferred_roles, work_preference, cv_file_name, cv_storage_path",
          )
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          throw profileError;
        }

        if (!data?.cv_file_name || !data.cv_storage_path) {
          router.replace("/cv");
          return;
        }

        const objectName = data.cv_storage_path.split("/").pop();
        const { data: objects, error: storageError } = await supabase.storage
          .from("cv-resumes")
          .list(`${user.id}/cv`, { limit: 1000 });

        if (storageError) {
          throw storageError;
        }

        if (!objects?.some((object) => object.name === objectName)) {
          router.replace("/cv");
          return;
        }

        if (!active) return;

        const existingProfile: Profile = {
          full_name: data.full_name,
          location: data.location,
          experience: data.experience,
          skills: data.skills ?? [],
          preferred_roles: data.preferred_roles ?? [],
          work_preference: data.work_preference,
        };

        setFileName(data.cv_file_name);
        setValues(toValues(existingProfile));
        setLoading(false);
        setExtracting(true);

        try {
          const response = await fetch("/api/cv/profile", { method: "POST" });
          const payload = await response.json().catch(() => null);

          if (!response.ok) {
            throw new Error(
              typeof payload?.error === "string"
                ? payload.error
                : "Unable to read your CV",
            );
          }

          const extractedProfile = payload?.profile as
            | ExtractedCvProfile
            | undefined;

          if (!extractedProfile) {
            throw new Error("AI returned no profile details");
          }

          if (!active) return;

          setExtracted(extractedProfile);
          setValues((current) =>
            mergeExtracted(current, existingProfile, extractedProfile),
          );
        } catch (extractError) {
          if (!active) return;

          console.error("CV profile extraction error:", extractError);
          setError(
            extractError instanceof Error && extractError.message
              ? `${extractError.message}. You can still review and update your profile.`
              : "Radar couldn't read new details from your CV right now. You can still review and update your profile.",
          );
        } finally {
          if (active) {
            setExtracting(false);
          }
        }
      } catch (loadError) {
        console.error(loadError);

        if (active) {
          setError("We couldn't load your CV. Please try again.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [router, supabase]);

  const fromCv: Record<FieldKey, boolean> = {
    fullName: Boolean(extracted?.fullName),
    location: Boolean(extracted?.location),
    preferredRoles: Boolean(extracted?.preferredRoles.length),
    experience: Boolean(extracted?.experience),
    skills: Boolean(extracted?.skills.length),
    workPreference: Boolean(extracted?.workPreference),
  };

  const sections: ReviewSection[] = [
    {
      title: "Personal information",
      editable: true,
      fields: [
        {
          key: "fullName",
          label: "Name",
          kind: "text",
          fallback: "Not available",
        },
        {
          key: "location",
          label: "Location",
          kind: "text",
          fallback: "Not available",
        },
        {
          key: "preferredRoles",
          label: "Preferred roles",
          kind: "list",
          fallback: "Not added yet",
        },
        {
          key: "workPreference",
          label: "Work preference",
          kind: "select",
          options: WORK_PREFERENCES,
          fallback: "Not added yet",
        },
      ],
    },
    {
      title: "Experience",
      editable: true,
      fields: [
        {
          key: "experience",
          label: "Experience level",
          kind: "select",
          options: EXPERIENCE_LEVELS,
          fallback: "Not added yet",
        },
      ],
    },
    {
      title: "Skills",
      editable: true,
      fields: [
        {
          key: "skills",
          label: "Current skills",
          kind: "list",
          fallback: "No skills added yet",
        },
      ],
    },
    {
      title: "CV extraction",
      editable: false,
      fields: [],
      details: [
        [
          "Education",
          extracted ? extracted.education || "Not found in CV" : "Not available",
        ],
        [
          "Most recent role",
          extracted
            ? extracted.currentRole || "Not found in CV"
            : "Not available",
        ],
      ],
    },
  ];

  const updateField = (key: FieldKey, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    setConfirmed(false);
  };

  const toggleEditing = (title: string) => {
    setEditing((current) => ({ ...current, [title]: !current[title] }));
  };

  const confirmProfile = async () => {
    if (saving) return;

    setSaving(true);
    setError("");
    setConfirmed(false);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.replace("/login");
        return;
      }

      const fullName = values.fullName.trim();

      const { data: updated, error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          location: values.location.trim(),
          experience: values.experience,
          skills: splitList(values.skills),
          preferred_roles: splitList(values.preferredRoles),
          work_preference: values.workPreference,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
        .select("id")
        .maybeSingle();

      if (updateError) {
        throw updateError;
      }

      if (!updated) {
        throw new Error("Profile update was rejected");
      }

      if (fullName) {
        await supabase.auth.updateUser({
          data: {
            full_name: fullName,
          },
        });
      }

      setEditing({});
      setConfirmed(true);
      router.replace("/profile");
    } catch (saveError) {
      console.error(saveError);
      setError("We couldn't save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fafaf8] text-neutral-950 dark:bg-[#111110] dark:text-white">
        <div className="mx-auto w-full max-w-[900px] px-4 py-10 sm:px-6">
          <div className="h-8 w-40 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800" />
          <div className="mt-10 h-10 w-72 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800" />
          <div className="mt-8 h-24 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-900" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fafaf8] text-neutral-950 dark:bg-[#111110] dark:text-white">
      <div className="mx-auto w-full max-w-[900px] px-4 py-6 sm:px-6 lg:py-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-950 text-white dark:bg-white dark:text-neutral-950">
              <Sparkles className="h-4 w-4" />
            </div>

            <span className="text-sm font-bold tracking-tight">
              Opportunity Radar
            </span>
          </div>

          <span className="text-xs text-neutral-400">CV review</span>
        </header>

        <div className="mt-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-violet-600 dark:text-violet-400">
            Review
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Check what Radar found
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500 dark:text-neutral-400">
            Review and edit what Radar read from your CV before it is saved to
            your profile.
          </p>
        </div>

        <div className="mt-8 flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
            <FileText className="h-4 w-4" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold">{fileName}</p>
            <p className="mt-0.5 text-xs text-neutral-400">
              Your existing profile is shown below
            </p>
          </div>

          <span className="hidden items-center gap-1.5 text-xs font-semibold text-neutral-400 sm:flex">
            Review
          </span>
        </div>

        {extracting && (
          <p className="mt-3 inline-flex items-center gap-2 text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Reading your CV...
          </p>
        )}

        {error && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400"
          >
            {error}
          </div>
        )}

        <div className="mt-5 space-y-3">
          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4 dark:border-neutral-800">
                <h2 className="text-sm font-bold">{section.title}</h2>

                {section.editable ? (
                  <button
                    type="button"
                    onClick={() => toggleEditing(section.title)}
                    className={EDIT_BUTTON_CLASSNAME}
                  >
                    <Pencil className="h-3 w-3" />
                    {editing[section.title] ? "Done" : "Edit"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => router.push("/profile")}
                    className={EDIT_BUTTON_CLASSNAME}
                  >
                    <Pencil className="h-3 w-3" />
                    Edit
                  </button>
                )}
              </div>

              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {section.fields.map((field) => {
                  const isEditing =
                    section.editable && Boolean(editing[section.title]);

                  return (
                    <div
                      key={field.label}
                      className="grid gap-1 px-5 py-4 sm:grid-cols-[180px_1fr]"
                    >
                      <span className="inline-flex items-center gap-2 text-xs text-neutral-400">
                        {field.label}

                        {fromCv[field.key] && (
                          <Badge
                            variant="primary"
                            className="px-2 py-0.5 text-[10px]"
                          >
                            From CV
                          </Badge>
                        )}
                      </span>

                      {isEditing ? (
                        field.kind === "select" ? (
                          <select
                            value={values[field.key]}
                            onChange={(event) =>
                              updateField(field.key, event.target.value)
                            }
                            className={INPUT_CLASSNAME}
                          >
                            <option value="">Not set</option>

                            {(field.options ?? []).map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            value={values[field.key]}
                            onChange={(event) =>
                              updateField(field.key, event.target.value)
                            }
                            placeholder={
                              field.kind === "list"
                                ? "Separate with commas"
                                : field.label
                            }
                            className={INPUT_CLASSNAME}
                          />
                        )
                      ) : (
                        <span className="text-sm font-medium">
                          {values[field.key].trim() || field.fallback}
                        </span>
                      )}
                    </div>
                  );
                })}

                {section.details?.map(([label, value]) => (
                  <div
                    key={label}
                    className="grid gap-1 px-5 py-4 sm:grid-cols-[180px_1fr]"
                  >
                    <span className="text-xs text-neutral-400">{label}</span>
                    <span className="text-sm font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-5 rounded-xl border border-violet-100 bg-violet-50/60 p-5 dark:border-violet-500/20 dark:bg-violet-500/5">
          <div className="flex gap-3">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-violet-600 dark:text-violet-400" />

            <div>
              <h2 className="text-sm font-bold">Your approval matters</h2>

              <p className="mt-1 text-xs leading-5 text-neutral-500 dark:text-neutral-400">
                Radar only proposes details it can actually read from your CV.
                Nothing is saved to your profile until you confirm.
              </p>
            </div>
          </div>
        </div>

        {confirmed && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
            <Check className="h-4 w-4" />
            Profile information confirmed.
          </div>
        )}

        <footer className="mt-8 flex items-center justify-between border-t border-neutral-200 pt-5 dark:border-neutral-800">
          <button
            type="button"
            onClick={() => router.push("/cv")}
            className="inline-flex h-10 items-center gap-2 rounded-lg px-3 text-xs font-semibold text-neutral-500 transition hover:bg-neutral-100 dark:hover:bg-neutral-900"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>

          <button
            type="button"
            onClick={() => void confirmProfile()}
            disabled={saving || extracting}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-violet-600 px-4 text-xs font-semibold text-white transition hover:bg-violet-700 disabled:pointer-events-none disabled:opacity-40"
          >
            {saving ? "Saving..." : confirmed ? "Confirmed" : "Confirm profile"}

            {saving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : confirmed ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <ArrowRight className="h-3.5 w-3.5" />
            )}
          </button>
        </footer>
      </div>
    </main>
  );
}
