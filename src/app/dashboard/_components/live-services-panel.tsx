"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Loader2, PackageSearch, RefreshCw } from "lucide-react";
import { StatusPill } from "./dashboard-widgets";

export type LiveServiceKind = "boosting" | "logs" | "foreign-numbers" | "uk-premium" | "esim";

type LiveService = {
  externalId: string;
  name: string;
  description?: string;
  price: number;
  minOrder: number;
  maxOrder?: number;
  provider: string;
};

type LiveServicesPayload = {
  provider: string;
  services: LiveService[];
  fetchedAt: string;
};

function formatPrice(value: number) {
  if (!Number.isFinite(value) || value <= 0) return "Provider-priced";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 4
  }).format(value);
}

export function LiveServicesPanel({
  kind,
  title,
  description,
  limit = 12
}: {
  kind: LiveServiceKind;
  title: string;
  description: string;
  limit?: number;
}) {
  const [state, setState] = useState<"loading" | "ready" | "empty" | "error">("loading");
  const [payload, setPayload] = useState<LiveServicesPayload | null>(null);
  const [error, setError] = useState("");
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState("loading");
      setError("");
      try {
        const response = await fetch(`/api/providers/services?kind=${kind}`, { cache: "no-store" });
        const body = await response.json();
        if (cancelled) return;
        if (!response.ok) throw new Error(body.error || "Provider fetch failed.");
        const services = Array.isArray(body.services) ? body.services : [];
        setPayload({ provider: body.provider, services, fetchedAt: body.fetchedAt });
        setState(services.length ? "ready" : "empty");
      } catch (caught) {
        if (cancelled) return;
        setState("error");
        setError(caught instanceof Error ? caught.message : "Unable to fetch provider services.");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [kind, refreshToken]);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/70 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-slate-800">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
        </div>
        <button
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          type="button"
          onClick={() => setRefreshToken((value) => value + 1)}
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {state === "loading" ? (
        <div className="mt-5 flex min-h-40 items-center justify-center rounded-lg bg-slate-50 text-sm font-semibold text-slate-600">
          <Loader2 className="mr-2 h-5 w-5 animate-spin text-blue-600" />
          Fetching live provider services...
        </div>
      ) : null}

      {state === "error" ? (
        <div className="mt-5 rounded-lg border border-rose-100 bg-rose-50 p-4 text-sm leading-6 text-rose-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-bold">Provider fetch failed</p>
              <p>{error}</p>
            </div>
          </div>
        </div>
      ) : null}

      {state === "empty" ? (
        <div className="mt-5 grid min-h-40 place-items-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
          <PackageSearch className="h-8 w-8 text-slate-400" />
          <div>
            <p className="mt-3 font-bold text-slate-800">No live services returned</p>
            <p className="mt-1 max-w-md text-sm leading-6 text-slate-600">
              The provider connection completed, but no services matched this section.
            </p>
          </div>
        </div>
      ) : null}

      {state === "ready" && payload ? (
        <>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
            <StatusPill status={payload.provider} />
            <span>Fetched {new Date(payload.fetchedAt).toLocaleString()}</span>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {payload.services.slice(0, limit).map((service) => (
              <article key={`${service.provider}-${service.externalId}`} className="rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-blue-50/50">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="line-clamp-2 text-sm font-bold leading-5 text-slate-800">{service.name}</h4>
                  <span className="shrink-0 rounded-md bg-white px-2 py-1 text-xs font-bold text-slate-500 ring-1 ring-slate-200">
                    {service.externalId}
                  </span>
                </div>
                {service.description ? <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-600">{service.description}</p> : null}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-slate-600">
                  <span>{formatPrice(service.price)}</span>
                  <span>Min {service.minOrder}{service.maxOrder ? ` / Max ${service.maxOrder}` : ""}</span>
                </div>
              </article>
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
