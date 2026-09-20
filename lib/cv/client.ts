import type { SupabaseClient } from "@supabase/supabase-js";

export const CV_BUCKET = "cv-resumes";
export const MAX_CV_FILE_SIZE = 10 * 1024 * 1024;

const VALID_CV_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export type StoredCV = {
  fileName: string;
  storagePath: string;
  uploadedAt: string;
};

export type CvStorageResult = {
  cv: StoredCV;
  warning?: string;
};

function getCvExtension(fileName: string) {
  return fileName.toLowerCase().split(".").pop() ?? "";
}

function isValidCvFile(file: File) {
  const extension = getCvExtension(file.name);

  return (
    (extension === "pdf" || extension === "docx") &&
    VALID_CV_MIME_TYPES.has(file.type)
  );
}

function sanitizeCvFileName(fileName: string) {
  const extension = getCvExtension(fileName);
  const base = fileName
    .slice(0, fileName.length - extension.length - 1)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);

  return `${base || "cv"}.${extension}`;
}

function buildCvStoragePath(userId: string, fileName: string) {
  return `${userId}/cv/${sanitizeCvFileName(fileName)}`;
}

export function isUserScopedCvPath(userId: string, storagePath: string) {
  const segments = storagePath.split("/");

  return (
    segments.length === 3 &&
    segments[0] === userId &&
    segments[1] === "cv" &&
    segments.every((segment) => segment && segment !== "." && segment !== "..")
  );
}

export function validateCvFile(file: File) {
  if (!isValidCvFile(file)) {
    return "Please choose a PDF or DOCX file.";
  }

  if (file.size > MAX_CV_FILE_SIZE) {
    return "Your CV is larger than 10 MB. Please choose a smaller file.";
  }

  return null;
}

export function formatCvUploadedAt(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Uploaded";
  }

  return `Uploaded · ${date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;
}

export async function getAuthenticatedUserId(supabase: SupabaseClient) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Authentication is required.");
  }

  return user.id;
}

export async function loadStoredCv(supabase: SupabaseClient) {
  const userId = await getAuthenticatedUserId(supabase);
  const { data, error: profileError } = await supabase
    .from("profiles")
    .select("cv_file_name, cv_storage_path, cv_uploaded_at")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    throw profileError;
  }

  if (
    data?.cv_file_name &&
    data.cv_storage_path &&
    data.cv_uploaded_at &&
    isUserScopedCvPath(userId, data.cv_storage_path)
  ) {
    return {
      fileName: data.cv_file_name,
      storagePath: data.cv_storage_path,
      uploadedAt: data.cv_uploaded_at,
    };
  }

  return null;
}

export async function uploadCv(
  supabase: SupabaseClient,
  file: File,
): Promise<CvStorageResult> {
  const validationError = validateCvFile(file);

  if (validationError) {
    throw new Error(validationError);
  }

  const userId = await getAuthenticatedUserId(supabase);
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("cv_storage_path")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    throw profileError;
  }

  const previousPath = profile?.cv_storage_path ?? null;
  const storagePath = buildCvStoragePath(userId, file.name);
  const { error: uploadError } = await supabase.storage
    .from(CV_BUCKET)
    .upload(storagePath, file, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    throw uploadError;
  }

  const uploadedAt = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      cv_file_name: file.name,
      cv_storage_path: storagePath,
      cv_uploaded_at: uploadedAt,
    })
    .eq("id", userId)
    .select("id")
    .single();

  if (updateError) {
    await supabase.storage.from(CV_BUCKET).remove([storagePath]);
    throw updateError;
  }

  let warning: string | undefined;

  if (
    previousPath &&
    previousPath !== storagePath &&
    isUserScopedCvPath(userId, previousPath)
  ) {
    const { error: deleteError } = await supabase.storage
      .from(CV_BUCKET)
      .remove([previousPath]);

    if (deleteError) {
      warning =
        "CV updated, but the previous stored file could not be deleted.";
    }
  }

  return {
    cv: {
      fileName: file.name,
      storagePath,
      uploadedAt,
    },
    warning,
  };
}

export async function removeCv(
  supabase: SupabaseClient,
  storedCv: StoredCV,
) {
  const userId = await getAuthenticatedUserId(supabase);

  if (!isUserScopedCvPath(userId, storedCv.storagePath)) {
    throw new Error("Your CV storage record is invalid.");
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      cv_file_name: null,
      cv_storage_path: null,
      cv_uploaded_at: null,
    })
    .eq("id", userId)
    .select("id")
    .single();

  if (updateError) {
    throw updateError;
  }

  const { error: deleteError } = await supabase.storage
    .from(CV_BUCKET)
    .remove([storedCv.storagePath]);

  return deleteError
    ? "CV removed from your profile, but the stored file could not be deleted."
    : null;
}
