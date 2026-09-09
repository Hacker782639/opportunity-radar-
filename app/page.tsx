import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  Clock3,
  Compass,
  FileText,
  Radar,
  Search,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";

const matches = [
  {
    score: 96,
    title: "Frontend Engineer",
    company: "Vercel",
    meta: "Remote Worldwide · Junior",
  },
  {
    score: 93,
    title: "Junior Software Engineer",
    company: "Andela",
    meta: "Remote Africa · Junior",
  },
  {
    score: 91,
    title: "Frontend Developer",
    company: "Wellfound",
    meta: "Remote Worldwide · Entry",
  },
];

const categories = [
  {
    icon: BriefcaseBusiness,
    label: "Jobs",
    text: "Roles matched to your skills and experience.",
  },
  {
    icon: Trophy,
    label: "Scholarships",
    text: "Funding and study opportunities worth seeing.",
  },
  {
    icon: Target,
    label: "Grants",
    text: "Programs built around your interests and goals.",
  },
  {
    icon: Compass,
    label: "Fellowships & Hackathons",
    text: "High-signal opportunities beyond job boards.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#111110] text-white">
      {/* NAV */}
      <nav className="relative z-20 border-b border-white/[0.07]">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#171717] text-white">
              <Radar className="h-[18px] w-[18px]" />
            </span>
            <span className="text-[15px] font-bold tracking-[-0.02em]">
              Opportunity Radar
            </span>
          </Link>

          <div className="hidden items-center gap-8 text-sm font-medium text-white/50 md:flex">
            <a
              href="#how-it-works"
              className="transition hover:text-white"
            >
              How it works
            </a>
            <a
              href="#opportunities"
              className="transition hover:text-white"
            >
              Opportunities
            </a>
            <a
              href="#intelligence"
              className="transition hover:text-white"
            >
              Intelligence
            </a>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/login"
              className="hidden px-3 py-2 text-sm font-semibold text-white/55 transition hover:text-white sm:block"
            >
              Sign in
            </Link>

            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#171717] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#2a2a2a]"
            >
              Get started
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "linear-gradient(rgba(23,23,23,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(23,23,23,.035) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage:
              "linear-gradient(to bottom, black 0%, transparent 78%)",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-16 sm:px-8 sm:pt-20 lg:px-10 lg:pb-28 lg:pt-24">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-[#171717]/80 px-3.5 py-2 text-xs font-semibold text-white shadow-sm backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-600" />
              </span>
              Personal opportunity intelligence
            </div>

            <h1 className="text-balance text-[44px] font-bold leading-[0.98] tracking-[-0.055em] sm:text-[64px] lg:text-[82px]">
              Stop searching.
              <br />
              <span className="text-white/55">Start seeing</span> what fits.
            </h1>

            <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-white/50 sm:text-lg sm:leading-8">
              Opportunity Radar finds jobs, scholarships, grants, fellowships,
              and hackathons that actually align with your skills, experience,
              and goals.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/login"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#171717] px-6 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_rgba(23,23,23,.14)] transition hover:-translate-y-0.5 hover:bg-[#2b2b2b] sm:w-auto"
              >
                Explore opportunities
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>

              <Link
                href="/signup"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.10] bg-[#171717] px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:border-white/15 sm:w-auto"
              >
                Create free account
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/30">
              <span>Jobs</span>
              <span>Scholarships</span>
              <span>Grants</span>
              <span>Fellowships</span>
              <span>Hackathons</span>
            </div>
          </div>

          {/* PRODUCT PREVIEW */}
          <div className="relative mx-auto mt-16 max-w-5xl sm:mt-20">
            <div className="absolute -inset-5 rounded-[30px] bg-white/[0.07]0/100/[0.06] blur-2xl" />

            <div className="relative overflow-hidden rounded-[24px] border border-black/[0.10] bg-[#171717] p-2 shadow-[0_30px_80px_rgba(23,23,23,.18)]">
              <div className="overflow-hidden rounded-[19px] border border-white/[0.07] bg-[#111110]">
                <div className="flex h-11 items-center justify-between border-b border-white/[0.07] px-4 sm:px-5">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/[0.07]0/100 text-white">
                      <Radar className="h-3.5 w-3.5" />
                    </div>

                    <span className="text-[11px] font-semibold text-white/80">
                      Your Radar
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="hidden text-[10px] text-white/35 sm:block">
                      Updated just now
                    </span>
                    <div className="h-2 w-2 rounded-full bg-emerald-400" />
                  </div>
                </div>

                <div className="grid lg:grid-cols-[1fr_270px]">
                  <div className="p-4 sm:p-6">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-white/35">
                          Strongest matches
                        </p>

                        <h2 className="mt-1 text-xl font-semibold tracking-tight text-white sm:text-2xl">
                          3 opportunities worth your attention
                        </h2>
                      </div>

                      <span className="hidden rounded-lg border border-white/[0.08] px-2.5 py-1.5 text-[10px] font-semibold text-white/45 sm:block">
                        View all
                      </span>
                    </div>

                    <div className="mt-5 space-y-2">
                      {matches.map((item, index) => (
                        <div
                          key={item.title}
                          className="group flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3 transition hover:border-white/[0.16] hover:bg-white/[0.04] sm:p-3.5"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-white/65">
                            {index === 0 ? (
                              <Sparkles className="h-4 w-4 text-white" />
                            ) : (
                              <BriefcaseBusiness className="h-4 w-4" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-xs font-semibold text-white sm:text-sm">
                                {item.title}
                              </p>

                              <span className="hidden text-[10px] text-white/30 sm:block">
                                ·
                              </span>

                              <span className="hidden text-[10px] text-white/40 sm:block">
                                {item.company}
                              </span>
                            </div>

                            <p className="mt-1 truncate text-[10px] text-white/35">
                              {item.meta}
                            </p>
                          </div>

                          <div className="shrink-0 text-right">
                            <div className="text-sm font-bold text-white">
                              {item.score}%
                            </div>

                            <div className="mt-0.5 text-[9px] text-white/30">
                              match
                            </div>
                          </div>

                          <ChevronRight className="hidden h-4 w-4 text-white/20 sm:block" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* INSIGHT PANEL */}
                  <div className="border-t border-white/[0.07] bg-white/[0.02] p-4 lg:border-l lg:border-t-0 sm:p-6">
                    <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">
                      <Sparkles className="h-3.5 w-3.5 text-white" />
                      Radar insight
                    </div>

                    <div className="mt-7">
                      <div className="flex items-end justify-between">
                        <span className="text-4xl font-bold tracking-[-0.04em] text-white">
                          96%
                        </span>

                        <span className="rounded-md bg-emerald-400/10 px-2 py-1 text-[9px] font-bold text-emerald-300">
                          Excellent fit
                        </span>
                      </div>

                      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                        <div className="h-full w-[96%] rounded-full bg-white" />
                      </div>

                      <p className="mt-5 text-xs leading-5 text-white/45">
                        Your frontend skills, experience level, and remote
                        preference strongly align with this opportunity.
                      </p>
                    </div>

                    <div className="mt-7 border-t border-white/[0.07] pt-5">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-white/30">
                        Why it surfaced
                      </p>

                      <div className="mt-3 space-y-2.5">
                        {[
                          "Skills match",
                          "Experience match",
                          "Location match",
                        ].map((reason) => (
                          <div
                            key={reason}
                            className="flex items-center gap-2 text-[10px] text-white/55"
                          >
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-400/10">
                              <Check className="h-2.5 w-2.5 text-emerald-300" />
                            </span>

                            {reason}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* FLOATING SIGNALS */}
            <div className="absolute -bottom-5 -left-3 hidden items-center gap-2 rounded-xl border border-white/[0.09] bg-[#171717] px-3 py-2.5 shadow-lg sm:flex">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.07]0/100/10 text-white">
                <Clock3 className="h-3.5 w-3.5" />
              </span>

              <div>
                <p className="text-[9px] font-semibold uppercase tracking-wider text-white/30">
                  Deadline
                </p>

                <p className="text-[11px] font-bold text-white">
                  3 need attention
                </p>
              </div>
            </div>

            <div className="absolute -right-3 -top-5 hidden items-center gap-2 rounded-xl border border-white/[0.09] bg-[#171717] px-3 py-2.5 shadow-lg sm:flex">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.07]0/100/10 text-white">
                <Bookmark className="h-3.5 w-3.5" />
              </span>

              <div>
                <p className="text-[9px] font-semibold uppercase tracking-wider text-white/30">
                  Pipeline
                </p>

                <p className="text-[11px] font-bold text-white">
                  12 saved
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OPPORTUNITY TYPES */}
      <section id="opportunities" className="border-y border-white/[0.07] bg-[#111110]">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-white">
              One radar. Every opportunity.
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
              The right opportunity is bigger than a job board.
            </h2>

            <p className="mt-4 text-sm leading-6 text-white/50 sm:text-base">
              Discover opportunities across the places that can actually move
              your career forward.
            </p>
          </div>

          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-white/[0.07] bg-black/[0.07] sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="bg-[#171717] p-6 transition hover:bg-[#1c1c1b]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06] text-white/65">
                    <Icon className="h-[18px] w-[18px]" />
                  </div>

                  <h3 className="mt-5 text-sm font-bold">{item.label}</h3>

                  <p className="mt-2 text-xs leading-5 text-white/50">
                    {item.text}
                  </p>

                  <div className="mt-5 flex items-center gap-1 text-[10px] font-bold text-white">
                    Explore
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-white">
                How it works
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
                Less scrolling.
                <br />
                Better decisions.
              </h2>

              <p className="mt-5 max-w-md text-sm leading-6 text-white/50">
                Build your profile once. Radar turns it into a signal for
                finding opportunities worth your time.
              </p>
            </div>

            <div className="divide-y divide-black/[0.07] border-y border-white/[0.07]">
              {[
                {
                  number: "01",
                  icon: FileText,
                  title: "Tell Radar what you're building toward",
                  text: "Add your skills, experience, interests, and preferences.",
                },
                {
                  number: "02",
                  icon: Search,
                  title: "Radar scans for your signal",
                  text: "Opportunities are organized around relevance instead of noise.",
                },
                {
                  number: "03",
                  icon: Sparkles,
                  title: "Understand why each match matters",
                  text: "See match strength and the signals behind every recommendation.",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.number}
                    className="flex gap-5 py-7 sm:gap-7"
                  >
                    <span className="pt-1 text-[10px] font-bold tracking-wider text-white/30">
                      {item.number}
                    </span>

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-white/70 ring-1 ring-white/[0.08]">
                      <Icon className="h-4 w-4" />
                    </div>

                    <div>
                      <h3 className="text-sm font-bold">{item.title}</h3>

                      <p className="mt-1.5 max-w-lg text-xs leading-5 text-white/50">
                        {item.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* INTELLIGENCE */}
      <section
        id="intelligence"
        className="border-y border-white/[0.07] bg-[#171717] text-white"
      >
        <div className="mx-auto grid max-w-7xl gap-14 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:items-center lg:px-10 lg:py-28">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-white">
              Opportunity intelligence
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em] sm:text-5xl">
              A match score is useful.
              <br />
              <span className="text-white/45">Knowing why is better.</span>
            </h2>

            <p className="mt-5 max-w-xl text-sm leading-6 text-white/45 sm:text-base">
              Radar doesn't just throw opportunities at you. It gives you the
              context to decide what deserves your attention.
            </p>

            <div className="mt-8 space-y-3">
              {[
                "Skills and experience signals",
                "Location and work preference",
                "Opportunity type and career direction",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2.5 text-xs text-white/65"
                >
                  <Check className="h-4 w-4 text-white" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="rounded-2xl border border-white/[0.09] bg-white/[0.035] p-5 sm:p-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-white/30">
                    Match quality
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    Frontend Engineer
                  </p>
                </div>

                <span className="text-3xl font-bold text-white">
                  96%
                </span>
              </div>

              <div className="mt-5 h-1.5 rounded-full bg-white/[0.07]">
                <div className="h-full w-[96%] rounded-full bg-white" />
              </div>

              <div className="mt-7 grid gap-2 sm:grid-cols-3">
                {[
                  ["Skills", "Strong"],
                  ["Experience", "Strong"],
                  ["Location", "Perfect"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-white/[0.07] bg-black/10 p-3"
                  >
                    <p className="text-[9px] uppercase tracking-wider text-white/30">
                      {label}
                    </p>

                    <p className="mt-1.5 text-xs font-semibold text-white/75">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-xl border border-white/[0.10] bg-white/[0.045] p-4">
                <div className="flex items-center gap-2 text-[10px] font-bold text-white">
                  <Sparkles className="h-3.5 w-3.5" />
                  Why this fits
                </div>

                <p className="mt-2 text-xs leading-5 text-white/45">
                  Your React, JavaScript, and frontend experience align closely
                  with what this role is looking for.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section>
        <div className="mx-auto max-w-7xl px-5 py-20 text-center sm:px-8 lg:px-10 lg:py-28">
          <div className="mx-auto max-w-2xl">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.07]0/100/10 text-white">
              <Radar className="h-5 w-5" />
            </div>

            <h2 className="mt-6 text-3xl font-bold tracking-[-0.045em] sm:text-5xl">
              Your next opportunity
              <br />
              <span className="text-white">is out there.</span>
            </h2>

            <p className="mx-auto mt-5 max-w-lg text-sm leading-6 text-white/50">
              Stop spending hours searching through noise. Let your profile
              become the signal.
            </p>

            <Link
              href="/signup"
              className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-[#171717] px-6 py-3.5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#2b2b2b]"
            >
              Create your radar
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.07]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#171717] text-white">
              <Radar className="h-3.5 w-3.5" />
            </span>

            <span className="text-xs font-bold">
              Opportunity Radar
            </span>
          </div>

          <p className="text-[10px] text-white/30">
            Find better opportunities. Make better moves.
          </p>

          <div className="flex items-center gap-4 text-[10px] font-semibold text-white/50">
            <Link
              href="/login"
              className="transition hover:text-white"
            >
              Sign in
            </Link>

            <Link
              href="/signup"
              className="transition hover:text-white"
            >
              Create account
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
