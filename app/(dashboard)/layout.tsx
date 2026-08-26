// app/(dashboard)/layout.tsx
import Sidebar from "@/app/components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: 260, background: "var(--background)" }}>
        <div style={{ maxWidth: 1040, padding: "48px 40px" }}>
          {children}
        </div>
      </main>
    </div>
  );
}
