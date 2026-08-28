import { ExternalLink, PlayCircle, Send, Video } from "lucide-react";

const tutorials = [
  {
    title: "How to sign up and fund your wallet",
    description: "Create your Acctrise account and learn how to add money to your wallet.",
    category: "Getting started",
    href: "https://t.me/acctrise/3"
  },
  {
    title: "How to buy or rent foreign numbers",
    description: "Learn how to get a foreign number for app verification, including WhatsApp.",
    category: "Foreign numbers",
    href: "https://t.me/acctrise/4"
  }
] as const;

export default function TutorialsPage() {
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
        <span className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm">
          <PlayCircle className="h-4 w-4 text-blue-600" /> {tutorials.length} tutorials available
        </span>
      </header>

      <section className="grid gap-5 md:grid-cols-2">
        {tutorials.map((tutorial, index) => (
          <a
            key={tutorial.href}
            href={tutorial.href}
            target="_blank"
            rel="noreferrer"
            className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-blue-700">{tutorial.category}</span>
              <span className="text-xs font-bold text-slate-400">Tutorial {index + 1}</span>
            </div>
            <div className="mt-8 grid h-12 w-12 place-items-center rounded-2xl bg-blue-600 text-white"><Send className="h-5 w-5" /></div>
            <h2 className="mt-5 text-xl font-black text-slate-950">{tutorial.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{tutorial.description}</p>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-blue-700">Watch on Telegram <ExternalLink className="h-4 w-4" /></span>
          </a>
        ))}
      </section>

    </div>
  );
}
