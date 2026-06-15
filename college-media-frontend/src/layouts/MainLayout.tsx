import type { ReactNode } from "react";
import Sidebar from "../components/common/Sidebar";

interface Props {
  children: ReactNode;
}

export default function MainLayout({
  children,
}: Props) {
  return (
    <div className="flex min-h-screen">

      <Sidebar />

      <main
        className="
        flex-1
        max-w-3xl
        mx-auto
        border-x
        p-6
      "
      >
        {children}
      </main>

      <aside
        className="
        hidden
        lg:block
        w-80
        p-6
      "
      >
        <h2 className="font-bold text-xl">
          College Media
        </h2>

        <p className="mt-3 text-gray-500">
          AI Assistant Coming Soon
        </p>
      </aside>

    </div>
  );
}