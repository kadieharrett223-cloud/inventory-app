import { appConfig } from "@/lib/config";

export default function SettingsPage() {
  return (
    <section className="mx-auto w-full max-w-6xl">
      <div className="rounded-2xl border border-[var(--line-soft)] bg-[var(--panel)] p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
          Settings
        </p>
        <h2 className="mt-2 text-2xl font-bold">Integration Config</h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          This page is wired to configuration placeholders. Add your env vars next.
        </p>

        <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-xl border border-[var(--line-soft)] bg-[var(--panel-strong)] p-3">
            <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Supabase URL</dt>
            <dd className="mt-1 break-all font-medium">{appConfig.supabaseUrl ?? "Not set"}</dd>
          </div>
          <div className="rounded-xl border border-[var(--line-soft)] bg-[var(--panel-strong)] p-3">
            <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">QBO Client</dt>
            <dd className="mt-1 break-all font-medium">{appConfig.qboClientId ?? "Not set"}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
