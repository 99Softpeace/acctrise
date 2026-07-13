import Link from "next/link";
import { ArrowRight, BookOpen, ChevronDown, CircleCheck, Smartphone, Wallet, Zap } from "lucide-react";

const lessons = [
  { icon: Wallet, title: "Understand your wallet", text: "Check your available balance and transaction history before placing an order.", time: "2 min", steps: ["Open Fund Wallet from the dashboard navigation.", "Review your balance and recent transaction history.", "Keep payment receipts or references available if you contact support."] },
  { icon: Zap, title: "Place your first order", text: "Choose a service, enter the required details, review the price, and submit.", time: "3 min", steps: ["Choose the service category from the dashboard.", "Select a live service and enter the requested link or username carefully.", "Review the quantity and total price, then place the order."] },
  { icon: Smartphone, title: "Rent a virtual number", text: "Select a country and service, receive your number, then copy the OTP when it arrives.", time: "3 min", steps: ["Choose Rent Number or USA Premium in the dashboard.", "Pick a country and verification service, then confirm the order.", "Stay on the order screen and copy the code as soon as it arrives."] },
  { icon: CircleCheck, title: "Track delivery", text: "Follow order progress and review completed purchases from My Orders.", time: "2 min", steps: ["Open My Orders from the sidebar.", "Use the current status to check whether the order is processing or complete.", "Contact support with the order reference if it is delayed past the expected window."] }
];

export default function TutorialsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-blue-700 p-7 text-white shadow-xl shadow-blue-900/10 sm:p-10">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-blue-100 ring-1 ring-white/15"><BookOpen className="h-4 w-4" /> Acctrise Academy</div>
        <h1 className="max-w-2xl text-3xl font-black tracking-tight sm:text-5xl">Learn the platform in minutes.</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100 sm:text-base">Short, practical guides for funding your wallet, buying services, renting numbers, and tracking every order.</p>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">Start here</p><h2 className="mt-1 text-2xl font-black text-slate-900">Quick tutorials</h2></div>
          <span className="text-sm font-semibold text-slate-500">10 minutes total</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {lessons.map((lesson, index) => { const Icon = lesson.icon; return (
            <article key={lesson.title} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg">
              <div className="flex items-start gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700"><Icon className="h-5 w-5" /></span>
                <div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><span className="text-xs font-bold uppercase tracking-wider text-blue-600">Lesson {index + 1}</span><span className="text-xs font-semibold text-slate-400">{lesson.time}</span></div><h3 className="mt-2 text-lg font-extrabold text-slate-900">{lesson.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{lesson.text}</p></div>
              </div>
              <details className="group/guide mt-5 border-t border-slate-100 pt-4"><summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-bold text-blue-700 marker:hidden">Read guide <ChevronDown className="ml-auto h-4 w-4 transition group-open/guide:rotate-180" /></summary><ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-600">{lesson.steps.map((step) => <li key={step}>{step}</li>)}</ol></details>
            </article>
          ); })}
        </div>
      </section>

      <section className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-center">
        <div><h2 className="text-lg font-extrabold text-slate-900">Need more help?</h2><p className="mt-1 text-sm text-slate-600">Find answers to common questions about accounts, payments, and orders.</p></div>
        <Link href="/#faq" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700">View FAQs <ArrowRight className="h-4 w-4" /></Link>
      </section>
    </div>
  );
}
