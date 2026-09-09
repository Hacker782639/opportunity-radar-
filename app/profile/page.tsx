"use client";

import { useEffect, useState } from "react";
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
import { createClient } from "@/lib/supabase/client";

const initialSkills = [
  "JavaScript",
  "React",
  "Next.js",
  "TypeScript",
  "HTML",
  "CSS",
  "Git",
];

const initialRoles = [
  "Frontend Developer",
  "Software Engineer",
];

export default function ProfilePage() {
  const supabase = createClient();

  const [fullName, setFullName] = useState("Junior");
  const [location, setLocation] = useState("Nigeria");
  const [experience, setExperience] = useState("Beginner");
  const [skills, setSkills] = useState(initialSkills);
  const [roles, setRoles] = useState(initialRoles);
  const [workPreference, setWorkPreference] = useState("Remote");

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newSkill, setNewSkill] = useState("");
  const [newRole, setNewRole] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select(
          "full_name, location, experience, skills, preferred_roles, work_preference",
        )
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        setFullName(
          profile.full_name ||
            user.user_metadata?.full_name ||
            user.email?.split("@")[0] ||
            "Junior",
        );

        setLocation(profile.location || "Nigeria");
        setExperience(profile.experience || "Beginner");

        setSkills(
          profile.skills?.length
            ? profile.skills
            : initialSkills,
        );

        setRoles(
          profile.preferred_roles?.length
            ? profile.preferred_roles
            : initialRoles,
        );

        setWorkPreference(
          profile.work_preference || "Remote",
        );
      }

      setLoading(false);
    };

    loadProfile();
  }, []);

  const saveProfile = async () => {
    if (saving) return;

    setSaving(true);
    setSaved(false);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim() || "Junior",
        location: location.trim() || "Nigeria",
        experience,
        skills,
        preferred_roles: roles,
        work_preference: workPreference,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      console.error("Profile update error:", error);
      setSaving(false);
      return;
    }

    await supabase.auth.updateUser({
      data: {
        full_name: fullName.trim() || "Junior",
      },
    });

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

          <section className="mt-6 rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950">
                <UserRound className="h-7 w-7" />
              </div>

              <div className="min-w-0">
                <h2 className="text-lg font-bold">
                  {loading ? "Loading..." : fullName}
                </h2>

                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  {roles[0] || "Frontend Developer"}
                </p>

                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-neutral-400">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {location}
                  </span>

                  <span>{experience}</span>

                  <span>Open to opportunities</span>
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

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">

            <div className="space-y-6">

              <section className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 sm:p-6">
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
                      className="mt-2 h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/10 dark:border-neutral-800 dark:bg-neutral-950"
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
                      className="mt-2 h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/10 dark:border-neutral-800 dark:bg-neutral-950"
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
                      className="mt-2 h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/10 dark:border-neutral-800 dark:bg-neutral-950"
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
                      className="mt-2 h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none dark:border-neutral-800 dark:bg-neutral-950"
                    >
                      <option>Beginner</option>
                      <option>Entry Level</option>
                      <option>Junior</option>
                      <option>Mid Level</option>
                      <option>Senior</option>
                    </select>
                  </label>

                </div>
              </section>

              <section className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 sm:p-6">
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
                        className="rounded-lg bg-violet-50 px-3 py-2 text-[11px] font-semibold text-violet-700 dark:bg-violet-500/10 dark:text-violet-400"
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
                        className="h-9 w-28 rounded-lg border border-neutral-200 bg-white px-2.5 text-[11px] outline-none focus:border-violet-400 dark:border-neutral-800 dark:bg-neutral-950"
                      />

                      <button
                        type="button"
                        onClick={addRole}
                        className="inline-flex items-center gap-1 rounded-lg border border-dashed border-neutral-300 px-3 py-2 text-[11px] font-semibold text-neutral-500 hover:border-neutral-400 dark:border-neutral-700"
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
                    {["Remote", "Hybrid", "On-site"].map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() =>
                          setWorkPreference(item)
                        }
                        className={`rounded-lg border px-3 py-2.5 text-xs font-semibold transition ${
                          workPreference === item
                            ? "border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-400"
                            : "border-neutral-200 text-neutral-500 hover:border-neutral-300 dark:border-neutral-800"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 sm:p-6">
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
                      className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-100 px-3 py-2 text-[11px] font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
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
                      className="h-9 w-28 rounded-lg border border-neutral-200 bg-white px-2.5 text-[11px] outline-none focus:border-violet-400 dark:border-neutral-800 dark:bg-neutral-950"
                    />

                    <button
                      type="button"
                      onClick={addSkill}
                      className="inline-flex items-center gap-1 rounded-lg border border-dashed border-neutral-300 px-3 py-2 text-[11px] font-semibold text-neutral-500 dark:border-neutral-700"
                    >
                      <Plus className="h-3 w-3" />
                      Add skill
                    </button>
                  </div>

                </div>
              </section>

              <section className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 sm:p-6">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-neutral-400" />
                  <h2 className="text-sm font-bold">
                    Education & experience
                  </h2>
                </div>

                <div className="mt-5 space-y-3">

                  <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
                    <p className="text-xs font-bold">
                      Education
                    </p>

                    <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                      Add your school, degree or current education.
                    </p>
                  </div>

                  <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
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

            <aside className="space-y-6">

              <section className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
                <p className="text-xs font-semibold text-neutral-500">
                  Profile strength
                </p>

                <div className="mt-3 flex items-end justify-between">
                  <span className="text-2xl font-bold">
                    {Math.min(
                      100,
                      35 +
                        (fullName ? 10 : 0) +
                        (location ? 10 : 0) +
                        (experience ? 10 : 0) +
                        Math.min(skills.length * 3, 15) +
                        Math.min(roles.length * 5, 10) +
                        (workPreference ? 10 : 0),
                    )}
                    %
                  </span>

                  <span className="text-[11px] text-neutral-400">
                    Live
                  </span>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <div
                    className="h-full rounded-full bg-neutral-950 transition-all dark:bg-white"
                    style={{
                      width: `${Math.min(
                        100,
                        35 +
                          (fullName ? 10 : 0) +
                                                    (location ? 10 : 0) +
                          (experience ? 10 : 0) +
                          Math.min(skills.length * 3, 15) +
                          Math.min(roles.length * 5, 10) +
                          (workPreference ? 10 : 0),
                      )}%`,
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
