"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteField } from "firebase/firestore";
import { toast } from "sonner";
import { auth } from "@/app/lib/firebase/app";
import { signOutUser, subscribeToAuthState } from "@/app/lib/firebase/auth";
import {
  COLLECTIONS,
  dateToTimestamp,
  getDocumentData,
  updateDocument,
} from "@/app/lib/firebase/firestore";
import {
  buildUserProfilePhotoPath,
  deleteFile,
  getDownloadUrl,
  uploadFile,
  validateProfilePhotoFile,
} from "@/app/lib/firebase/storage";
import { BackLink } from "@/components/auth/ui";
import { ProfilePhotoField } from "@/components/account/ProfilePhotoField";
import {
  adminCardClass,
  adminInputClass,
  adminPageDescClass,
  adminPageSectionClass,
  adminPageTitleClass,
  adminPrimaryBtnClass,
  adminSecondaryBtnClass,
} from "@/components/admin/adminConsolePrimitives";
import { Loader } from "@/components/Loader";
import { clearSessionCookie } from "@/lib/admin/adminAuth";
import {
  e164ToUsPhoneInput,
  formatUsPhoneInput,
  isValidNanp10,
  usPhoneDigitsFromInput,
  usDigitsToE164,
} from "@/lib/phoneUs";
import type { User } from "@/types";

export function SettingsProfileClient() {
  const router = useRouter();
  const [loadState, setLoadState] = useState<"loading" | "ready" | "unauthenticated">("loading");
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [initialName, setInitialName] = useState("");
  const [initialPhone, setInitialPhone] = useState("");
  const [profilePhotoPath, setProfilePhotoPath] = useState("");
  const [profilePhotoUrl, setProfilePhotoUrl] = useState("");
  const [selectedProfilePhoto, setSelectedProfilePhoto] = useState<File | null>(null);
  const [removeCurrentPhoto, setRemoveCurrentPhoto] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const unsub = subscribeToAuthState(async (user) => {
      if (!user) {
        if (!cancelled) {
          setLoadState("unauthenticated");
          router.replace("/signup");
        }
        return;
      }
      if (!cancelled) setEmail(user.email ?? "");
      const { data } = await getDocumentData<User>(COLLECTIONS.users, user.uid);
      if (cancelled) return;
      const n =
        data?.name?.trim() || user.displayName?.trim() || "";
      const p = data?.phone ? e164ToUsPhoneInput(data.phone) : "";
      const photoPath = data?.profilePhotoPath?.trim() || "";
      setName(n);
      setPhone(p);
      setInitialName(n);
      setInitialPhone(p);
      setProfilePhotoPath(photoPath);
      if (photoPath) {
        try {
          const url = await getDownloadUrl(photoPath);
          setProfilePhotoUrl(url);
        } catch {
          setProfilePhotoUrl("");
        }
      } else {
        setProfilePhotoUrl("");
      }
      setLoadState("ready");
    });
    return () => {
      cancelled = true;
      unsub();
    };
  }, [router]);

  const dirty =
    name.trim() !== initialName.trim() ||
    usPhoneDigitsFromInput(phone) !== usPhoneDigitsFromInput(initialPhone) ||
    Boolean(selectedProfilePhoto) ||
    removeCurrentPhoto;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) {
      toast.error("Session expired. Please sign in again.");
      router.replace("/signup");
      return;
    }
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Please enter your name.");
      return;
    }
    const digits = usPhoneDigitsFromInput(phone);
    let phonePayload: string | ReturnType<typeof deleteField>;
    if (!digits) {
      phonePayload = deleteField();
    } else {
      if (!isValidNanp10(digits)) {
        toast.error("Enter a valid US phone number (10 digits).");
        return;
      }
      const e164 = usDigitsToE164(digits);
      if (!e164) {
        toast.error("Enter a valid US phone number (10 digits).");
        return;
      }
      phonePayload = e164;
    }
    const existingPhotoPath = profilePhotoPath.trim();
    let nextPhotoPath: string | null = removeCurrentPhoto ? null : existingPhotoPath || null;
    let uploadedPhotoPath = "";
    if (selectedProfilePhoto) {
      const photoError = validateProfilePhotoFile(selectedProfilePhoto);
      if (photoError) {
        toast.error(photoError);
        return;
      }
      const uploadPath = buildUserProfilePhotoPath(user.uid, selectedProfilePhoto.name);
      try {
        await uploadFile(uploadPath, selectedProfilePhoto, { contentType: selectedProfilePhoto.type || "image/jpeg" });
        nextPhotoPath = uploadPath;
        uploadedPhotoPath = uploadPath;
      } catch {
        toast.error("Could not upload profile picture.");
        return;
      }
    }

    setSaving(true);
    try {
      const photoUpdate =
        nextPhotoPath !== null
          ? { profilePhotoPath: nextPhotoPath }
          : removeCurrentPhoto
            ? { profilePhotoPath: deleteField() }
            : {};
      await updateDocument(COLLECTIONS.users, user.uid, {
        id: user.uid,
        name: trimmedName,
        phone: phonePayload,
        email: user.email ?? "",
        ...photoUpdate,
        updatedAt: dateToTimestamp(new Date()),
      } as Parameters<typeof updateDocument>[2]);
      if (existingPhotoPath && nextPhotoPath !== existingPhotoPath) {
        void deleteFile(existingPhotoPath).catch(() => undefined);
      }
      setName(trimmedName);
      setInitialName(trimmedName);
      if (typeof phonePayload === "string") {
        const display = e164ToUsPhoneInput(phonePayload);
        setPhone(display);
        setInitialPhone(display);
      } else {
        setPhone("");
        setInitialPhone("");
      }
      setProfilePhotoPath(nextPhotoPath ?? "");
      if (nextPhotoPath) {
        try {
          const url = await getDownloadUrl(nextPhotoPath);
          setProfilePhotoUrl(url);
        } catch {
          setProfilePhotoUrl("");
        }
      } else {
        setProfilePhotoUrl("");
      }
      setSelectedProfilePhoto(null);
      setRemoveCurrentPhoto(false);
      toast.success("Profile saved.");
    } catch (err) {
      if (uploadedPhotoPath) {
        void deleteFile(uploadedPhotoPath).catch(() => undefined);
      }
      toast.error(err instanceof Error ? err.message : "Could not save profile.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    if (!window.confirm("Are you sure you want to sign out?")) return;
    await clearSessionCookie();
    await signOutUser();
    router.push("/");
  }

  function handleSelectProfilePhoto(file: File | null) {
    if (!file) {
      setSelectedProfilePhoto(null);
      return;
    }
    const photoError = validateProfilePhotoFile(file);
    if (photoError) {
      toast.error(photoError);
      return;
    }
    setSelectedProfilePhoto(file);
    setRemoveCurrentPhoto(false);
  }

  if (loadState === "loading") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-white dark:bg-black">
        <Loader message="Loading profile…" />
      </div>
    );
  }

  if (loadState === "unauthenticated") {
    return null;
  }

  return (
    <div className="min-h-[100dvh] bg-white dark:bg-black">
      <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="mb-8">
          <BackLink href="/home/dashboard" aria-label="Back to home" />
        </div>

        <section className={adminPageSectionClass}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className={adminPageTitleClass}>Profile</h1>
              <p className={adminPageDescClass}>
                Update how your name and phone appear across inspections and invitations. Organization
                settings for property managers are in the admin console sidebar.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void handleSignOut()}
              className={`${adminSecondaryBtnClass} shrink-0 self-start sm:self-auto`}
            >
              Sign out
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className={`${adminCardClass} ${saving ? "pointer-events-none opacity-70" : ""}`}
            aria-busy={saving}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Your details
              </h2>
              <button
                type="submit"
                disabled={!dirty || saving}
                className={adminPrimaryBtnClass}
              >
                Save changes
              </button>
            </div>

            <div className="mt-6 grid gap-5">
              <ProfilePhotoField
                displayName={name}
                email={email}
                currentPhotoUrl={!removeCurrentPhoto ? profilePhotoUrl : undefined}
                selectedFile={selectedProfilePhoto}
                disabled={saving}
                onSelectFile={handleSelectProfilePhoto}
                onClearSelection={() => setSelectedProfilePhoto(null)}
                onRemoveCurrent={() => {
                  setRemoveCurrentPhoto(true);
                  setSelectedProfilePhoto(null);
                }}
              />
              <div>
                <label
                  htmlFor="profile-name"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
                >
                  Full name
                </label>
                <input
                  id="profile-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={adminInputClass}
                  placeholder="Your name"
                  autoComplete="name"
                />
              </div>

              <div>
                <label
                  htmlFor="profile-email"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
                >
                  Email
                </label>
                <input
                  id="profile-email"
                  value={email}
                  readOnly
                  className={`${adminInputClass} cursor-not-allowed bg-zinc-50 text-zinc-600 dark:bg-zinc-900/60 dark:text-zinc-400`}
                />
                <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                  Email can&apos;t be changed here.{" "}
                  <Link href="/forgot-password" className="font-medium text-accent underline-offset-2 hover:underline">
                    Reset password
                  </Link>{" "}
                  uses your account email.
                </p>
              </div>

              <div>
                <label
                  htmlFor="profile-phone"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
                >
                  Phone <span className="font-normal normal-case text-zinc-400">(optional)</span>
                </label>
                <input
                  id="profile-phone"
                  value={phone}
                  onChange={(e) => setPhone(formatUsPhoneInput(e.target.value))}
                  className={adminInputClass}
                  placeholder="(555) 555-5555"
                  inputMode="tel"
                  autoComplete="tel"
                />
              </div>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
