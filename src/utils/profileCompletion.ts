import { ProfileField, User } from "@/interfaces/auth.interface";

/**
 * The profile fields the sign-up step can collect, in asking order.
 */
export const PROFILE_FIELDS: ProfileField[] = ["full_name", "nic", "email"];

/**
 * The profile fields an account still owes before sign-up is finished.
 *
 * An account is one record on the server whether it was created here or in the
 * mobile app, so it can arrive with some of these already saved. Ask only for
 * the fields returned here and send only those - asking again for a name or a
 * NIC the account already has overwrites what was saved on the other device.
 *
 * The server's `missingProfileFields` decides. A server that does not send it
 * yet falls back to the same three fields, checked for emptiness.
 */
export const getMissingProfileFields = (user?: User | null): ProfileField[] => {
  if (!user) return PROFILE_FIELDS;

  if (Array.isArray(user.missingProfileFields)) {
    return PROFILE_FIELDS.filter((field) =>
      user.missingProfileFields?.includes(field),
    );
  }

  const held: Record<ProfileField, string | null | undefined> = {
    full_name: user.fullName,
    nic: user.nic,
    email: user.email,
  };
  return PROFILE_FIELDS.filter((field) => !(held[field] || "").trim());
};
