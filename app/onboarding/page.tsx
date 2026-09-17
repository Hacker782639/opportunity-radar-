"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  MapPin,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";

const countries = [
  "Nigeria",
  "United States",
  "United Kingdom",
  "Canada",
  "Germany",
  "France",
  "Netherlands",
  "Australia",
  "South Africa",
  "Ghana",
  "Kenya",
  "Rwanda",
  "Uganda",
  "Egypt",
  "India",
  "United Arab Emirates",
  "Singapore",
  "Other",
];

const skills = [
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "HTML",
  "CSS",
  "Python",
  "Node.js",
  "Java",
  "C++",
  "PHP",
  "Flutter",
  "Dart",
  "SQL",
  "Git",
  "UI/UX Design",
  "Figma",
  "Machine Learning",
  "AI",
  "Cybersecurity",
];

const roles = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Software Engineer",
  "AI / ML Engineer",
  "Mobile Developer",
  "UI/UX Designer",
  "Data Analyst",
  "Cybersecurity",
  "DevOps Engineer",
];

const opportunityTypes = [
  "Jobs",
  "Scholarships",
  "Grants",
  "Fellowships",
  "Hackathons",
];

const experienceOptions = [
  {
    label: "Student",
    description: "I'm currently studying",
  },
  {
    label: "Entry Level",
    description: "I'm starting my career",
  },
  {
    label: "Junior",
    description: "I have some experience",
  },
  {
    label: "Mid Level",
    description: "I'm an experienced professional",
  },
  {
    label: "Senior",
    description: "I'm highly experienced",
  },
];

const workOptions = ["Remote", "Hybrid", "On-site", "Any"];

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [skillSearch, setSkillSearch] = useState("");
  const [roleSearch, setRoleSearch] = useState("");
  const [error, setError] = useState("");

  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("");
  const [experience, setExperience] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [workPreference, setWorkPreference] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      setFullName(
        data?.full_name ||
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          ""
      );
      setCountry(data?.location || "");
      setExperience(data?.experience || "");
      setSelectedSkills(data?.skills || []);
      setSelectedRoles(data?.preferred_roles || []);
      setSelectedTypes(data?.opportunity_types || []);
      setWorkPreference(data?.work_preference || "");
      setLoading(false);
    }

    void loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredCountries = useMemo(() => {
    const query = countrySearch.toLowerCase().trim();

    if (!query) return countries;

    return countries.filter((item) =>
      item.toLowerCase().includes(query)
    );
  }, [countrySearch]);

  const filteredSkills = useMemo(() => {
    const query = skillSearch.toLowerCase().trim();

    if (!query) return skills;

    return skills.filter((item) =>
      item.toLowerCase().includes(query)
    );
  }, [skillSearch]);

  const filteredRoles = useMemo(() => {
    const query = roleSearch.toLowerCase().trim();

    if (!query) return roles;

    return roles.filter((item) =>
      item.toLowerCase().includes(query)
    );
  }, [roleSearch]);

  function toggleItem(
    value: string,
    selected: string[],
    setter: (value: string[]) => void
  ) {
    setter(
      selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value]
    );
  }

  function canContinue() {
    if (step === 1) return country.trim().length > 0;
    if (step === 2) return experience.length > 0;
    if (step === 3) return selectedSkills.length > 0;
    if (step === 4) return selectedRoles.length > 0;
    return selectedTypes.length > 0;
  }

  async function saveAndFinish() {
    setSaving(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/login");
      return;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        full_name: fullName.trim() || null,
        location: country,
        experience,
        skills: selectedSkills,
        preferred_roles: selectedRoles,
        opportunity_types: selectedTypes,
        work_preference: workPreference || null,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      });

    if (profileError) {
      setError(profileError.message);
      setSaving(false);
      return;
    }

    await supabase.auth.updateUser({
      data: {
        full_name: fullName.trim() || null,
      },
    });

    router.replace("/dashboard");
  }

  function next() {
    if (!canContinue()) return;

    if (step < 5) {
      setStep((current) => current + 1);
      return;
    }

    void saveAndFinish();
  }

  function back() {
    if (step > 1) {
      setStep((current) => current - 1);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fafaf8] text-neutral-950 dark:bg-[#111110] dark:text-white">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-950 dark:border-neutral-700 dark:border-t-white" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fafaf8] text-neutral-950 dark:bg-[#111110] dark:text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-950 text-white dark:bg-white dark:text-neutral-950">
              <Sparkles size={17} />
            </div>
            <span className="text-sm font-semibold tracking-tight">
              Opportunity Radar
            </span>
          </div>

          <span className="text-xs font-medium text-neutral-500">
            Step {step} of 5
          </span>
        </header>

        <div className="mx-auto mt-8 w-full max-w-2xl">
          <div className="flex gap-1.5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded-full transition-all ${
                  index + 1 <= step
                    ? "bg-neutral-950 dark:bg-white"
                    : "bg-neutral-200 dark:bg-neutral-800"
                }`}
              />
            ))}
          </div>
        </div>

        <section className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center py-10">
          {step === 1 && (
            <StepContainer
              eyebrow="01 · About you"
              title="Where are you based?"
              description="We'll use your location to find opportunities you're eligible for."
            >
              <label className="mb-2 block text-sm font-medium">
                Country
              </label>

              <button
                type="button"
                onClick={() => setCountryOpen((value) => !value)}
                className="flex w-full items-center justify-between rounded-2xl border border-neutral-200 bg-white px-4 py-4 text-left shadow-sm transition hover:border-neutral-400 dark:border-neutral-800 dark:bg-[#171716] dark:hover:border-neutral-600"
              >
                <span className={country ? "" : "text-neutral-500"}>
                  {country || "Select your country"}
                </span>
                <ChevronDown
                  size={18}
                  className={`transition-transform ${
                    countryOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {countryOpen && (
                <div className="mt-2 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-lg dark:border-neutral-800 dark:bg-[#171716]">
                  <div className="flex items-center gap-2 border-b border-neutral-200 px-4 dark:border-neutral-800">
                    <Search size={17} className="text-neutral-400" />
                    <input
                      autoFocus
                      value={countrySearch}
                      onChange={(event) =>
                        setCountrySearch(event.target.value)
                      }
                      placeholder="Search countries..."
                      className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
                    />
                  </div>

                  <div className="max-h-64 overflow-y-auto p-2">
                    {filteredCountries.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          setCountry(item);
                          setCountryOpen(false);
                          setCountrySearch("");
                        }}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm transition hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      >
                        <span>{item}</span>
                        {country === item && <Check size={16} />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-5 flex items-center gap-2 text-xs text-neutral-500">
                <MapPin size={14} />
                Your location improves opportunity matching.
              </div>
            </StepContainer>
          )}

          {step === 2 && (
            <StepContainer
              eyebrow="02 · Experience"
              title="Where are you in your career?"
              description="This helps us prioritize opportunities at the right level."
            >
              <div className="space-y-2">
                {experienceOptions.map((option) => {
                  const selected = experience === option.label;

                  return (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => setExperience(option.label)}
                      className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition ${
                        selected
                          ? "border-neutral-950 bg-neutral-950 text-white dark:border-white dark:bg-white dark:text-neutral-950"
                          : "border-neutral-200 bg-white hover:border-neutral-400 dark:border-neutral-800 dark:bg-[#171716] dark:hover:border-neutral-600"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-semibold">
                          {option.label}
                        </p>
                        <p
                          className={`mt-1 text-xs ${
                            selected
                              ? "text-neutral-300 dark:text-neutral-600"
                              : "text-neutral-500"
                          }`}
                        >
                          {option.description}
                        </p>
                      </div>

                      {selected && <Check size={18} />}
                    </button>
                  );
                })}
              </div>
            </StepContainer>
          )}

          {step === 3 && (
            <StepContainer
              eyebrow="03 · Skills"
              title="What can you work with?"
              description="Choose the skills you want Opportunity Radar to use for matching."
            >
              <SearchInput
                value={skillSearch}
                onChange={setSkillSearch}
                placeholder="Search skills..."
              />

              {selectedSkills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedSkills.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() =>
                        toggleItem(
                          skill,
                          selectedSkills,
                          setSelectedSkills
                        )
                      }
                      className="inline-flex items-center gap-1.5 rounded-full bg-neutral-950 px-3 py-1.5 text-xs font-medium text-white dark:bg-white dark:text-neutral-950"
                    >
                      {skill}
                      <X size={13} />
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-5 flex max-h-64 flex-wrap gap-2 overflow-y-auto pr-1">
                {filteredSkills.map((skill) => {
                  const selected = selectedSkills.includes(skill);

                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() =>
                        toggleItem(
                          skill,
                          selectedSkills,
                          setSelectedSkills
                        )
                      }
                      className={`rounded-full border px-3.5 py-2 text-xs font-medium transition ${
                        selected
                          ? "border-neutral-950 bg-neutral-950 text-white dark:border-white dark:bg-white dark:text-neutral-950"
                          : "border-neutral-200 bg-white hover:border-neutral-400 dark:border-neutral-800 dark:bg-[#171716] dark:hover:border-neutral-600"
                      }`}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>

              <p className="mt-4 text-xs text-neutral-500">
                {selectedSkills.length} skill
                {selectedSkills.length === 1 ? "" : "s"} selected
              </p>
            </StepContainer>
          )}

          {step === 4 && (
            <StepContainer
              eyebrow="04 · Career goals"
              title="What kind of work are you looking for?"
              description="Select one or more roles you'd like your radar to prioritize."
            >
              <SearchInput
                value={roleSearch}
                onChange={setRoleSearch}
                placeholder="Search roles..."
              />

              <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {filteredRoles.map((role) => {
                  const selected = selectedRoles.includes(role);

                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() =>
                        toggleItem(
                          role,
                          selectedRoles,
                          setSelectedRoles
                        )
                      }
                      className={`flex min-h-16 items-center justify-between rounded-2xl border px-4 text-left text-sm font-medium transition ${
                        selected
                          ? "border-neutral-950 bg-neutral-950 text-white dark:border-white dark:bg-white dark:text-neutral-950"
                          : "border-neutral-200 bg-white hover:border-neutral-400 dark:border-neutral-800 dark:bg-[#171716] dark:hover:border-neutral-600"
                      }`}
                    >
                      <span>{role}</span>
                      {selected && <Check size={17} />}
                    </button>
                  );
                })}
              </div>
            </StepContainer>
          )}

          {step === 5 && (
            <StepContainer
              eyebrow="05 · Preferences"
              title="What should we prioritize?"
              description="Choose the opportunities and work styles that fit you."
            >
              <p className="mb-3 text-sm font-medium">Opportunity types</p>

              <div className="flex flex-wrap gap-2">
                {opportunityTypes.map((type) => {
                  const selected = selectedTypes.includes(type);

                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() =>
                        toggleItem(
                          type,
                          selectedTypes,
                          setSelectedTypes
                        )
                      }
                      className={`rounded-full border px-4 py-2.5 text-xs font-medium transition ${
                        selected
                          ? "border-neutral-950 bg-neutral-950 text-white dark:border-white dark:bg-white dark:text-neutral-950"
                          : "border-neutral-200 bg-white hover:border-neutral-400 dark:border-neutral-800 dark:bg-[#171716] dark:hover:border-neutral-600"
                      }`}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>

              <p className="mb-3 mt-7 text-sm font-medium">
                Work preference
              </p>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {workOptions.map((option) => {
                  const selected = workPreference === option;

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setWorkPreference(option)}
                      className={`rounded-2xl border px-3 py-3 text-xs font-medium transition ${
                        selected
                          ? "border-neutral-950 bg-neutral-950 text-white dark:border-white dark:bg-white dark:text-neutral-950"
                          : "border-neutral-200 bg-white hover:border-neutral-400 dark:border-neutral-800 dark:bg-[#171716] dark:hover:border-neutral-600"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              <div className="mt-7 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-[#171716]">
                <p className="text-sm font-semibold">
                  Your radar is almost ready.
                </p>
                <p className="mt-1 text-xs leading-5 text-neutral-500">
                  We&apos;ll use your preferences to rank opportunities that
                  fit your profile.
                </p>
              </div>
            </StepContainer>
          )}

          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
              {error}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <button
              type="button"
              onClick={back}
              disabled={step === 1 || saving}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                step === 1
                  ? "pointer-events-none opacity-0"
                  : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-950 dark:hover:bg-neutral-800 dark:hover:text-white"
              }`}
            >
              <ArrowLeft size={16} />
              Back
            </button>

            <button
              type="button"
              onClick={next}
              disabled={!canContinue() || saving}
              className="inline-flex items-center gap-2 rounded-xl bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
            >
              {saving
                ? "Setting up..."
                : step === 5
                  ? "Build my radar"
                  : "Continue"}
              {!saving && <ArrowRight size={16} />}
            </button>
          </div>
        </section>

        <footer className="pb-2 text-center text-xs text-neutral-400">
          Your preferences can be changed anytime from your profile.
        </footer>
      </div>
    </main>
  );
}

function StepContainer({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
        {eyebrow}
      </p>

      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h1>

      <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-500 sm:text-base">
        {description}
      </p>

      <div className="mt-8">{children}</div>
    </div>
  );
}

function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-4 dark:border-neutral-800 dark:bg-[#171716]">
      <Search size={17} className="shrink-0 text-neutral-400" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
      />
    </div>
  );
}
