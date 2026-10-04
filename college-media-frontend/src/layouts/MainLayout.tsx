import type { ReactNode } from "react";
import Sidebar from "../components/common/Sidebar";
import { FiCompass } from "react-icons/fi";

interface Props {
  children: ReactNode;
}

export default function MainLayout({
  children,
}: Props) {
  return (
    <div className="min-h-screen bg-[#f5f7fb] md:flex">
      <Sidebar />
      <main className="min-w-0 flex-1 px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-8"><div className="mx-auto w-full max-w-3xl">{children}</div></main>
      <aside className="hidden w-72 shrink-0 px-5 py-7 xl:block"><div className="sticky top-7 rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 p-6 text-white shadow-xl shadow-indigo-200"><FiCompass className="mb-5 text-2xl" /><h2 className="text-xl font-bold">Make your campus smaller.</h2><p className="mt-2 text-sm leading-6 text-indigo-100">Share ideas, find your people, and keep the conversation moving.</p></div></aside>
    </div>
  );
}
