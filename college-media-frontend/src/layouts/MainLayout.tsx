import type { ReactNode } from "react";
import Sidebar from "../components/common/Sidebar";
import { FiCompass } from "react-icons/fi";

interface Props {
  children: ReactNode;
  wide?: boolean;
  hideAside?: boolean;
  contentClassName?: string;
}

export default function MainLayout({
  children,
  wide = false,
  hideAside = false,
  contentClassName = "",
}: Props) {
  return (
    <div className="min-h-screen bg-[#f5f7fb] md:flex">
      <Sidebar />
      <main className={`min-w-0 flex-1 px-3 sm:px-6 lg:px-8 pb-20 md:pb-8 pt-4 sm:pt-6 ${contentClassName}`}>
        <div className={`mx-auto w-full ${wide ? "max-w-5xl xl:max-w-6xl" : "max-w-3xl"}`}>
          {children}
        </div>
      </main>
      {!hideAside && (
        <aside className="hidden w-72 shrink-0 px-5 py-7 xl:block">
          <div className="sticky top-7 rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 p-6 text-white shadow-xl shadow-indigo-200">
            <FiCompass className="mb-5 text-2xl" />
            <h2 className="text-xl font-bold">Make your campus smaller.</h2>
            <p className="mt-2 text-sm leading-6 text-indigo-100">
              Share ideas, find your people, and keep the conversation moving.
            </p>
          </div>
        </aside>
      )}
    </div>
  );
}
