import Link from "next/link";
import "../admin.css";

export default function SetupRequiredPage() {
  return <main className="admin-gate"><div><p className="admin-kicker">Admin locked</p><h1>Owner access is not configured.</h1><p>The dashboard remains unavailable until an explicit ADMIN_EMAILS allowlist is added to the preview environment.</p><Link href="/">Return to the public site</Link></div></main>;
}
