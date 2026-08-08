import { redirect } from "next/navigation";
import { getChatGPTUser, requireChatGPTUser, type ChatGPTUser } from "../app/chatgpt-auth";

export type AdminIdentity = ChatGPTUser & { localPreview: boolean };

function allowedEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function isLocalDevelopment() {
  return process.env.NODE_ENV !== "production";
}

function authorize(user: ChatGPTUser): AdminIdentity | null {
  const allowlist = allowedEmails();
  if (allowlist.length === 0 || !allowlist.includes(user.email.toLowerCase())) return null;
  return { ...user, localPreview: false };
}

export async function requireAdmin(returnTo = "/admin"): Promise<AdminIdentity> {
  if (isLocalDevelopment()) {
    return {
      userId: "local-admin",
      email: "local-preview@lesliechiunda.com",
      displayName: "Leslie",
      fullName: "Leslie",
      localPreview: true,
    };
  }

  const user = await requireChatGPTUser(returnTo);
  if (allowedEmails().length === 0) redirect("/admin/setup-required");
  const admin = authorize(user);
  if (!admin) redirect("/admin/unauthorized");
  return admin;
}

export async function getAdminForApi(): Promise<AdminIdentity | null> {
  if (isLocalDevelopment()) {
    return {
      userId: "local-admin",
      email: "local-preview@lesliechiunda.com",
      displayName: "Leslie",
      fullName: "Leslie",
      localPreview: true,
    };
  }
  if (allowedEmails().length === 0) return null;
  const user = await getChatGPTUser();
  return user ? authorize(user) : null;
}
