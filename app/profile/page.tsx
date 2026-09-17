"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  Check,
  ExternalLink,
  GraduationCap,
  Link2,
  MapPin,
  Plus,
  Save,
  UserRound,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { ProfileCvSection } from "@/components/profile/cv-section";
import { createClient } from "@/lib/supabase/client";
import { calculateProfileStrength } from "@/lib/profile/strength";

export default function ProfilePage() {
  const supabase = useMemo(() => createClient(), []);

  const [fullName, setFullName] = useState("");
  const [location, setLocation] = useState("");
  const [experience, setExperience] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [workPreference, setWorkPreference] = useState("");
  const [opportunityTypes, setOpportunityTypes] = useState<string[]>([]);
  const [hasCv, setHasCv] = useState(false);

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);
  const [newSkill, setNewSkill] = useState("");
  const [newRole, setNewRole] = useState("");

  const profileStrength = calculateProfileStrength({
    full_name: fullName,
    location,
    experience,
    skills,
    preferred_roles: roles,
    opportunity_types: opportunityTypes,
    work_preference: workPreference,
    has_cv: hasCv,
  });

  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select(
          "full_name, location, experience, skills, preferred_roles, opportunity_types, work_preference, cv_file_name, cv_storage_path",
        )
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error("Profile lookup error:", profileError);
        setLoadError("Unable to load your profile. Please try again.");
        setLoading(false);
        return;
      }

      if (profile) {
        setFullName(
          profile.full_name ||
            (typeof user.user_metadata?.full_name === "string"
              ? user.user_metadata.full_name
              : ""),
        );
        setLocation(profile.location ?? "");
        setExperience(profile.experience ?? "");
        setSkills(profile.skills ?? []);
        setRoles(profile.preferred_roles ?? []);
        setOpportunityTypes(profile.opportunity_types ?? []);
        setWorkPreference(profile.work_preference ?? "");
        setHasCv(Boolean(profile.cv_file_name && profile.cv_storage_path));
      }

      setLoading(false);
    };

    loadProfile();
  }, [supabase]);

  const saveProfile = async () => {
    if (saving) return;

    setSaving(true);
    setSaved(false);
    setSaveError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSaveError("Please sign in to save your profile.");
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim(),
        location: location.trim(),
        experience,
        skills,
        preferred_roles: roles,
        work_preference: workPreference,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      console.error("Profile update error:", error);
      setSaveError("Unable to save your profile. Please try again.");
      setSaving(false);
      return;
    }

    if (fullName.trim()) {
      await supabase.auth.updateUser({
        data: {
          full_name: fullName.trim(),
        },
      });
    }

    setSaved(true);
    setSaving(false);

    setTimeout(() => {
      setSaved(false);
    }, 1800);
  };

  const addSkill = () => {
    const value = newSkill.trim();

    if (!value) return;

    if (
      skills.some(
        (skill) => skill.toLowerCase() === value.toLowerCase(),
      )
    ) {
      setNewSkill("");
      return;
    }

    setSkills((current) => [...current, value]);
    setNewSkill("");
  };

  const addRole = () => {
    const value = newRole.trim();

    if (!value) return;

    if (
      roles.some(
        (role) => role.toLowerCase() === value.toLowerCase(),
      )
    ) {
      setNewRole("");
      return;
    }

    setRoles((current) => [...current, value]);
    setNewRole("");
  };

  const removeSkill = (skill: string) => {
    setSkills((current) =>
      current.filter((item) => item !== skill),
    );
  };

  const removeRole = (role: string) => {
    setRoles((current) =>
      current.filter((item) => item !== role),
    );
  };

  return (
    <AppShell>
      <main className="min-h-screen bg-[#fafaf8] text-neutral-950 dark:bg-[#111110] dark:text-white">
        <div className="mx-auto w-full max-w-[1100px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

          <section className="border-b border-neutral-200 pb-6 dark:border-neutral-800">
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <span>Account</span>
              <span>/</span>
              <span className="text-neutral-700 dark:text-neutral-300">
                Profile
              </span>
            </div>

            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Your profile
                </h1>

                <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
                  Keep your career information up to date so Radar can find better matches.
                </p>
              </div>

              <button
                type="button"
                onClick={saveProfile}
                disabled={saving || loading}
                className="inline-flex h-10 w-fit items-center gap-2 rounded-lg bg-neutral-950 px-4 text-xs font-bold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
              >
                {saved ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Save className="h-4 w-4" />
                )}

                {saving
                  ? "Saving..."
                  : saved
                    ? "Saved"
                    : "Save changes"}
              </button>
            </div>
          </section>

          {(loadError || saveError) && (
            <div
              role="alert"
              className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400"
            >
              {loadError || saveError}
            </div>
          )}

          <section className="mt-6 w-full min-w-0 rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] dark:border-neutral-800 dark:bg-neutral-900 sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950">
                <UserRound className="h-7 w-7" />
              </div>

              <div className="min-w-0">
                <h2 className="text-lg font-bold">
                  {loading
                    ? "Loading..."
                    : fullName || "Name not set"}
                </h2>

                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  {roles[0] || "Role not set"}
                </p>

                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-neutral-400">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {location || "Location not set"}
                  </span>

                  <span>{experience || "Experience not set"}</span>

                  <span>
                    {workPreference || "Work preference not set"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="sm:ml-auto text-xs font-semibold text-neutral-500 hover:text-neutral-950 dark:hover:text-white"
              >
                Change photo
              </button>
            </div>
          </section>

          <div className="mt-6 grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">

            <div className="min-w-0 space-y-6">

              <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] dark:border-neutral-800 dark:bg-neutral-900 sm:p-6">
                <div className="flex items-center gap-2">
                  <UserRound className="h-4 w-4 text-neutral-400" />
                  <h2 className="text-sm font-bold">
                    Basic information
                  </h2>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">

                  <label className="block">
                    <span className="text-xs font-semibold">
                      Full name
                    </span>

                    <input
                      value={fullName}
                      onChange={(e) =>
                        setFullName(e.target.value)
                      }
                      className="mt-2 h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm transition placeholder:text-neutral-400 hover:border-neutral-300 outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-950/10 dark:focus:border-neutral-400 dark:focus:ring-white/10 dark:border-neutral-800 dark:bg-neutral-950"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-semibold">
                      Professional title
                    </span>

                    <input
                      value={roles[0] || ""}
                      onChange={(e) => {
                        const value = e.target.value;

                        setRoles((current) =>
                          current.length
                            ? [value, ...current.slice(1)]
                            : [value],
                        );
                      }}
                      className="mt-2 h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm transition placeholder:text-neutral-400 hover:border-neutral-300 outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-950/10 dark:focus:border-neutral-400 dark:focus:ring-white/10 dark:border-neutral-800 dark:bg-neutral-950"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-semibold">
                      Location
                    </span>

                    <input
                      value={location}
                      onChange={(e) =>
                        setLocation(e.target.value)
                      }
                      className="mt-2 h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm transition placeholder:text-neutral-400 hover:border-neutral-300 outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-950/10 dark:focus:border-neutral-400 dark:focus:ring-white/10 dark:border-neutral-800 dark:bg-neutral-950"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-semibold">
                      Experience
                    </span>

                    <select
                      value={experience}
                      onChange={(e) =>
                        setExperience(e.target.value)
                      }
                      className="mt-2 h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm transition placeholder:text-neutral-400 hover:border-neutral-300 outline-none dark:border-neutral-800 dark:bg-neutral-950"
                    >
                      <option value="">Select experience</option>
                      <option>Student</option>
                      <option>Beginner</option>
                      <option>Entry Level</option>
                      <option>Junior</option>
                      <option>Mid Level</option>
                      <option>Senior</option>
                    </select>
                  </label>

                </div>
              </section>

              <ProfileCvSection
                supabase={supabase}
                onCvChange={setHasCv}
              />

              <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] dark:border-neutral-800 dark:bg-neutral-900 sm:p-6">
                <div className="flex items-center gap-2">
                  <BriefcaseBusiness className="h-4 w-4 text-neutral-400" />
                  <h2 className="text-sm font-bold">
                    Career preferences
                  </h2>
                </div>

                <div className="mt-5">
                  <p className="text-xs font-semibold">
                    Preferred roles
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">

                    {roles.map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => removeRole(role)}
                        className="rounded-lg border border-neutral-200 bg-neutral-100 px-3 py-2 text-[11px] font-semibold text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
                      >
                        {role} ×
                      </button>
                    ))}

                    <div className="flex items-center gap-2">
                      <input
                        value={newRole}
                        onChange={(e) =>
                          setNewRole(e.target.value)
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addRole();
                          }
                        }}
                        placeholder="New role"
                        className="h-9 w-28 rounded-xl border border-neutral-200 bg-white px-2.5 text-[11px] transition placeholder:text-neutral-400 hover:border-neutral-300 outline-none focus:border-neutral-500 dark:focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-950"
                      />

                      <button
                        type="button"
                        onClick={addRole}
                        className="inline-flex items-center gap-1 rounded-xl border border-dashed border-neutral-300 transition hover:border-neutral-500 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:border-neutral-500 dark:hover:bg-neutral-900 px-3 py-2 text-[11px] font-semibold text-neutral-500 hover:border-neutral-400 dark:border-neutral-700"
                      >
                        <Plus className="h-3 w-3" />
                        Add role
                      </button>
                    </div>

                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-xs font-semibold">
                    Work preference
                  </p>

                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {["Remote", "Hybrid", "On-site", "Any"].map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() =>
                          setWorkPreference(item)
                        }
                        className={`rounded-lg border px-3 py-2.5 text-xs font-semibold transition ${
                          workPreference === item
                            ? "border-neutral-950 bg-neutral-950 text-white dark:border-white dark:bg-white dark:text-neutral-950"
                            : "border-neutral-200 bg-white text-neutral-500 hover:border-neutral-400 hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-neutral-700 dark:hover:text-white"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] dark:border-neutral-800 dark:bg-neutral-900 sm:p-6">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-neutral-400" />
                  <h2 className="text-sm font-bold">
                    Skills
                  </h2>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">

                  {skills.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-neutral-100 px-3 py-2 text-[11px] font-semibold text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
                    >
                      {skill}
                      <span className="text-neutral-400">
                        ×
                      </span>
                    </button>
                  ))}

                  <div className="flex items-center gap-2">
                    <input
                      value={newSkill}
                      onChange={(e) =>
                        setNewSkill(e.target.value)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSkill();
                        }
                      }}
                      placeholder="New skill"
                      className="h-9 w-28 rounded-xl border border-neutral-200 bg-white px-2.5 text-[11px] transition placeholder:text-neutral-400 hover:border-neutral-300 outline-none focus:border-neutral-500 dark:focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-950"
                    />

                    <button
                      type="button"
                      onClick={addSkill}
                      className="inline-flex items-center gap-1 rounded-xl border border-dashed border-neutral-300 transition hover:border-neutral-500 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:border-neutral-500 dark:hover:bg-neutral-900 px-3 py-2 text-[11px] font-semibold text-neutral-500 dark:border-neutral-700"
                    >
                      <Plus className="h-3 w-3" />
                      Add skill
                    </button>
                  </div>

                </div>
              </section>

              <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] dark:border-neutral-800 dark:bg-neutral-900 sm:p-6">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-neutral-400" />
                  <h2 className="text-sm font-bold">
                    Education & experience
                  </h2>
                </div>

                <div className="mt-5 space-y-3">

                  <div className="rounded-xl border border-neutral-200 bg-neutral-50/70 p-4 transition hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-950/40 dark:hover:border-neutral-700">
                    <p className="text-xs font-bold">
                      Education
                    </p>

                    <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                      Add your school, degree or current education.
                    </p>
                  </div>

                  <div className="rounded-xl border border-neutral-200 bg-neutral-50/70 p-4 transition hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-950/40 dark:hover:border-neutral-700">
                    <p className="text-xs font-bold">
                      Experience
                    </p>

                    <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                      Your current experience level is{" "}
                      <span className="font-semibold text-neutral-700 dark:text-neutral-200">
                        {experience}
                      </span>
                      .
                    </p>
                  </div>

                </div>
              </section>

            </div>

            <aside className="min-w-0 space-y-6">

              <section className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
                <p className="text-xs font-semibold text-neutral-500">
                  Profile strength
                </p>

                <div className="mt-3 flex items-end justify-between">
                  <span className="text-2xl font-bold">
                    {profileStrength}%
                  </span>

                  <span className="text-[11px] text-neutral-400">
                    Live
                  </span>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <div
                    className="h-full rounded-full bg-neutral-950 transition-all dark:bg-white"
                    style={{
                      width: `${profileStrength}%`,
                    }}
                  />
                </div>

                <p className="mt-3 text-[11px] leading-5 text-neutral-500 dark:text-neutral-400">
                  Complete more of your profile to improve opportunity matching.
                </p>
              </section>

              <section className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
                <p className="text-xs font-bold">
                  Connected links
                </p>

                <div className="mt-4 space-y-2">

                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-lg border border-neutral-200 px-3 py-2.5 text-xs text-neutral-500 dark:border-neutral-800"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Link2 className="h-3.5 w-3.5" />
                      GitHub
                    </span>

                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-lg border border-neutral-200 px-3 py-2.5 text-xs text-neutral-500 dark:border-neutral-800"
                  >
                    <span className="inline-flex items-center gap-2">
                      <ExternalLink className="h-3.5 w-3.5" />
                      Portfolio
                    </span>

                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>

                </div>
              </section>

            </aside>

          </div>
        </div>
      </main>
    </AppShell>
  );
}
