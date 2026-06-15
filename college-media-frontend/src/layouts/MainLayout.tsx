import type { ReactNode } from "react";
import Sidebar from "../components/common/Sidebar";

interface Props {
  children: ReactNode;
}

export default function MainLayout({
  children,
}: Props) {
  return (
    /* Responsive shell: column flow on small screens, row on md+ */
    <div className="flex min-h-screen flex-col md:flex-row overflow-x-hidden w-full">

      <Sidebar />

      <main
        className="
        flex-1
        w-full
        min-w-0
        max-w-3xl
        mx-auto
        border-x
        p-4
        sm:p-5
        md:p-6
        pb-20
        md:pb-6
      "
      >
        {children}
      </main>

      <aside
        className="
        hidden
        lg:block
        w-80
        shrink-0
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
