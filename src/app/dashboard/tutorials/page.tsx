"use client";

import { Clock3, ExternalLink, Play, PlayCircle, Send, Video } from "lucide-react";

const TELEGRAM_TUTORIAL_URL = "https://t.me/acctrise/3";

type TutorialVideo = {
  title: string;
  description: string;
  duration: string;
  category: string;
  youtubeId: string;
};

// Paste the part after youtu.be/ or youtube.com/watch?v= into youtubeId.
const videos: TutorialVideo[] = [
  { title: "How to fund your wallet", description: "Learn how to add money to your Acctrise wallet and confirm your payment.", duration: "Coming soon", category: "Wallet", youtubeId: "" },
  { title: "How to place your first order", description: "A quick walkthrough of choosing a service and submitting the correct details.", duration: "Coming soon", category: "Getting started", youtubeId: "" },
  { title: "How to rent a virtual number", description: "See how to select a country, receive a number, and collect your OTP.", duration: "Coming soon", category: "Virtual numbers", youtubeId: "" },
  { title: "How to track your orders", description: "Check an order's progress and understand each delivery status.", duration: "Coming soon", category: "Orders", youtubeId: "" }
];

function VideoPlaceholder({ compact = false }: { compact?: boolean }) {
  return (
    <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-slate-950 via-blue-950 to-blue-700 text-center text-white">
      <div className="px-5">
        <span className={`${compact ? "h-12 w-12" : "h-16 w-16"} mx-auto grid place-items-center rounded-full bg-white/15 ring-1 ring-white/20`}>
          <Play className={`${compact ? "h-5 w-5" : "h-7 w-7"} fill-white`} />
        </span>
        {!compact && <p className="mt-4 text-sm font-bold text-blue-100">New video coming soon</p>}
      </div>
    </div>
  );
}

export default function TutorialsPage() {
  const activeVideo = videos[0];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.14em] text-red-600">
            <Video className="h-4 w-4" /> Acctrise Video Academy
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">Watch. Learn. Get started.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">Follow clear video walkthroughs and learn how to use every part of Acctrise.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href={TELEGRAM_TUTORIAL_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Send className="h-4 w-4" /> Watch tutorial on Telegram <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <span className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm">
            <PlayCircle className="h-4 w-4 text-blue-600" /> {videos.length} video lessons
          </span>
        </div>
      </header>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
        <div className="relative aspect-video w-full bg-slate-950">
          {activeVideo.youtubeId ? (
            <iframe
              key={activeVideo.youtubeId}
              className="absolute inset-0 h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${activeVideo.youtubeId}?rel=0`}
              title={activeVideo.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : <VideoPlaceholder />}
        </div>
        <div className="p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">{activeVideo.category}</span>
            <span className="inline-flex items-center gap-1.5 text-slate-400"><Clock3 className="h-3.5 w-3.5" /> {activeVideo.duration}</span>
          </div>
          <h2 className="mt-3 text-2xl font-black text-slate-950">{activeVideo.title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{activeVideo.description}</p>
        </div>
      </section>

    </div>
  );
}
