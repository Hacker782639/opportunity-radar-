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
        <div className="mx-auto max-w-[1180px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-400">
                Account
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                Profile
              </h1>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                Keep your career profile ready for better opportunities.
              </p>
            </div>

            <button
              type="button"
              onClick={saveProfile}
              disabled={saving || loading}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-neutral-950 px-4 text-xs font-bold text-white transition hover:bg-neutral-800 disabled:opacity-60 dark:bg-white dark:text-neutral-950"
            >
              {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {saving ? "Saving..." : saved ? "Saved" : "Save changes"}
            </button>
          </div>

          {(loadError || saveError) && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
              {loadError || saveError}
            </div>
          )}

          <section className="overflow-hidden rounded-3xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <div className="h-24 bg-neutral-950 dark:bg-neutral-800" />

            <div className="px-5 pb-6 sm:px-7">
              <div className="-mt-9 flex flex-col gap-4 sm:-mt-10 sm:flex-row sm:items-end sm:gap-5">
                <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-2xl border-4 border-white bg-neutral-100 text-neutral-700 shadow-sm dark:border-neutral-900 dark:bg-neutral-800 dark:text-white">
                  <UserRound className="h-8 w-8" />
                </div>

                <div className="min-w-0 pb-1">
                  <h2 className="text-xl font-bold">
                    {loading ? "Loading..." : fullName || "Name not set"}
                  </h2>
                  <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
                    {roles[0] || "Professional title not set"}
                  </p>
                </div>

                <div className="flex w-full flex-wrap gap-2 sm:ml-auto sm:w-auto sm:justify-end sm:pb-1">
                  {location && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5 text-[11px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                      <MapPin className="h-3 w-3" />
                      {location}
                    </span>
                  )}
                  {experience && (
                    <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-[11px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                      {experience}
                    </span>
                  )}
                  {workPreference && (
                    <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-[11px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                      {workPreference}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>

          <div className="mt-6 grid min-w-0 gap-5 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">

            <div className="space-y-6">

              <section className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 sm:p-6">
                <div className="mb-5">
                  <h2 className="text-sm font-bold">Personal information</h2>
                  <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                    Your basic professional details.
                  </p>
                </div>

                <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                  <label>
                    <span className="text-xs font-semibold">Full name</span>
                    <input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 text-sm outline-none transition focus:border-neutral-500 dark:border-neutral-800 dark:bg-neutral-950"
                    />
                  </label>

                  <label>
                    <span className="text-xs font-semibold">Professional title</span>
                    <input
                      value={roles[0] || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        setRoles((current) =>
                          current.length ? [value, ...current.slice(1)] : [value]
                        );
                      }}
                      className="mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 text-sm outline-none transition focus:border-neutral-500 dark:border-neutral-800 dark:bg-neutral-950"
                    />
                  </label>

                  <label>
                    <span className="text-xs font-semibold">Location</span>
                    <input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 text-sm outline-none transition focus:border-neutral-500 dark:border-neutral-800 dark:bg-neutral-950"
                    />
                  </label>

                  <label>
                    <span className="text-xs font-semibold">Experience</span>
                    <select
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 text-sm outline-none dark:border-neutral-800 dark:bg-neutral-950"
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

              <ProfileCvSection supabase={supabase} onCvChange={setHasCv} />

              <section className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 sm:p-6">
                <h2 className="text-sm font-bold">Career preferences</h2>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  Tell Radar what you're looking for.
                </p>

                <div className="mt-5">
                  <p className="text-xs font-semibold">Preferred roles</p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {roles.map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => removeRole(role)}
                        className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-2 text-[11px] font-semibold dark:border-neutral-700 dark:bg-neutral-800"
                      >
                        {role} <span className="ml-1 text-neutral-400">×</span>
                      </button>
                    ))}

                    <div className="flex gap-2">
                      <input
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addRole())}
                        placeholder="Add role"
                        className="h-9 w-28 rounded-full border border-neutral-200 bg-neutral-50 px-3 text-[11px] outline-none dark:border-neutral-700 dark:bg-neutral-950"
                      />
                      <button
                        type="button"
                        onClick={addRole}
                        className="inline-flex items-center gap-1 rounded-full border border-dashed border-neutral-300 px-3 text-[11px] font-semibold text-neutral-500 dark:border-neutral-700"
                      >
                        <Plus className="h-3 w-3" /> Add
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-xs font-semibold">Work preference</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {["Remote", "Hybrid", "On-site", "Any"].map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setWorkPreference(item)}
                        className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition ${
                          workPreference === item
                            ? "border-neutral-950 bg-neutral-950 text-white dark:border-white dark:bg-white dark:text-neutral-950"
                            : "border-neutral-200 text-neutral-500 dark:border-neutral-800"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 sm:p-6">
                <h2 className="text-sm font-bold">Skills</h2>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  Add the skills you want employers to find.
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-2 text-[11px] font-semibold dark:border-neutral-700 dark:bg-neutral-800"
                    >
                      {skill} <span className="ml-1 text-neutral-400">×</span>
                    </button>
                  ))}

                  <div className="flex gap-2">
                    <input
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                      placeholder="Add skill"
                      className="h-9 w-28 rounded-full border border-neutral-200 bg-neutral-50 px-3 text-[11px] outline-none dark:border-neutral-700 dark:bg-neutral-950"
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      className="inline-flex items-center gap-1 rounded-full border border-dashed border-neutral-300 px-3 text-[11px] font-semibold text-neutral-500 dark:border-neutral-700"
                    >
                      <Plus className="h-3 w-3" /> Add
                    </button>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 sm:p-6">
                <h2 className="text-sm font-bold">Education & experience</h2>

                <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-neutral-50 p-4 dark:bg-neutral-950">
                    <GraduationCap className="h-4 w-4 text-neutral-400" />
                    <p className="mt-3 text-xs font-bold">Education</p>
                    <p className="mt-1 text-[11px] leading-5 text-neutral-500">
                      Add your school, degree, or current education.
                    </p>
                  </div>

                  <div className="rounded-xl bg-neutral-50 p-4 dark:bg-neutral-950">
                    <BriefcaseBusiness className="h-4 w-4 text-neutral-400" />
                    <p className="mt-3 text-xs font-bold">Experience</p>
                    <p className="mt-1 text-[11px] leading-5 text-neutral-500">
                      Current level: {experience || "Not set"}.
                    </p>
                  </div>
                </div>
              </section>
            </div>

            <aside className="space-y-6">
              <section className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold">Profile completion</p>
                    <p className="mt-1 text-[11px] text-neutral-400">
                      Keep building your profile
                    </p>
                  </div>
                  <span className="text-xl font-bold">{profileStrength}%</span>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <div
                    className="h-full rounded-full bg-neutral-950 transition-all dark:bg-white"
                    style={{ width: `${profileStrength}%` }}
                  />
                </div>
              </section>

              <section className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
                <p className="text-xs font-bold">Career snapshot</p>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-800">
                    <span className="text-[11px] text-neutral-400">Primary role</span>
                    <span className="max-w-[150px] truncate text-right text-xs font-semibold">
                      {roles[0] || "Not set"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-800">
                    <span className="text-[11px] text-neutral-400">Work style</span>
                    <span className="text-xs font-semibold">
                      {workPreference || "Not set"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-neutral-400">CV</span>
                    <span className="text-xs font-semibold">
                      {hasCv ? "Uploaded" : "Not uploaded"}
                    </span>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
                <p className="text-xs font-bold">Connected links</p>

                <div className="mt-4 space-y-2">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-xl border border-neutral-200 px-3 py-3 text-xs text-neutral-500 dark:border-neutral-800"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Link2 className="h-3.5 w-3.5" /> GitHub
                    </span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-xl border border-neutral-200 px-3 py-3 text-xs text-neutral-500 dark:border-neutral-800"
                  >
                    <span className="inline-flex items-center gap-2">
                      <ExternalLink className="h-3.5 w-3.5" /> Portfolio
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
