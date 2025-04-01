import { Navigation } from "./navigation";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <Navigation />
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}
