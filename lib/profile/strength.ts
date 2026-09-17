export type ProfileStrengthInput = {
  full_name?: string | null;
  location?: string | null;
  experience?: string | null;
  skills?: string[] | null;
  preferred_roles?: string[] | null;
  opportunity_types?: string[] | null;
  work_preference?: string | null;
  has_cv?: boolean | null;
};

export function calculateProfileStrength(profile: ProfileStrengthInput) {
  const fields = [
    profile.full_name?.trim(),
    profile.location?.trim(),
    profile.experience?.trim(),
    profile.skills?.length ? "skills" : null,
    profile.preferred_roles?.length ? "roles" : null,
    profile.opportunity_types?.length ? "opportunity types" : null,
    profile.work_preference?.trim(),
    profile.has_cv ? "cv" : null,
  ];

  return Math.round(
    (fields.filter(Boolean).length / fields.length) * 100,
  );
}
