import { PlayCircle, Video } from "lucide-react";

const videoTutorials = [
  {
    title: "How to get numbers",
    description: "A quick walkthrough of how to get the number you need on Acctrise.",
    category: "Numbers",
    videoId: "OCCVHNK14MQ"
  },
  {
    title: "How to buy logs",
    description: "See how to find and purchase logs from your Acctrise dashboard.",
    category: "Logs",
    videoId: "e5f0gAMxtog"
  },
  {
    title: "How to boost an account",
    description: "Learn how to choose and order an account boosting service.",
    category: "Boosting",
    videoId: "SSaC5sHcS2g"
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
          <PlayCircle className="h-4 w-4 text-blue-600" /> {videoTutorials.length} tutorials available
        </span>
      </header>

      <section aria-labelledby="video-tutorials-heading">
        <div className="mb-5">
          <h2 id="video-tutorials-heading" className="text-2xl font-black tracking-tight text-slate-950">Quick video tutorials</h2>
          <p className="mt-1 text-sm text-slate-600">Press play to watch without leaving Acctrise.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {videoTutorials.map((tutorial, index) => (
            <article key={tutorial.videoId} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="mx-auto aspect-[9/16] max-h-[32rem] w-full bg-slate-950">
                <iframe
                  className="h-full w-full"
                  src={`https://www.youtube.com/embed/${tutorial.videoId}?rel=0`}
                  title={`${tutorial.title} video tutorial`}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-red-600">{tutorial.category}</span>
                  <span className="text-xs font-bold text-slate-400">Video {index + 1}</span>
                </div>
                <h3 className="mt-4 text-xl font-black text-slate-950">{tutorial.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{tutorial.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

    </div>
  );
}
