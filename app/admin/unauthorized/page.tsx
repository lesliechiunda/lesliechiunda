import Link from "next/link";
import "../admin.css";

export default function UnauthorizedPage() {
  return <main className="admin-gate"><div><p className="admin-kicker">Private workspace</p><h1>This account is not an administrator.</h1><p>The public website and concepts are still available to browse.</p><Link href="/">Return to the public site</Link></div></main>;
}
