import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Menu } from "lucide-react";
import { useCurrentUser, useSignOut } from "@/hooks/useCurrentUser";
import { ADMIN_NAV_ITEMS, NAV_ITEMS, ROLE_LABELS, canAccess } from "@/lib/rbac";
import { NtbMark } from "@/components/NtbMark";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const { data: me } = useCurrentUser();
  const role = me?.role ?? null;
  const items = NAV_ITEMS.filter((item) => canAccess(item, role));
  const adminItems = ADMIN_NAV_ITEMS.filter((item) => canAccess(item, role));

  return (
    <nav aria-label="Navigasi utama" className="space-y-8">
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.to}>
            <Link
              to={item.to}
              onClick={onNavigate}
              className="block rounded-md px-3 py-2 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              activeProps={{
                className:
                  "block rounded-md px-3 py-2 text-sm bg-sidebar-accent text-sidebar-accent-foreground font-medium",
              }}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      {adminItems.length > 0 && (
        <div>
          <p className="px-3 pb-2 text-[0.7rem] font-semibold tracking-[0.14em] text-sidebar-foreground/50 uppercase">
            Administrasi
          </p>
          <ul className="space-y-1">
            {adminItems.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={onNavigate}
                  className="block rounded-md px-3 py-2 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  activeProps={{
                    className:
                      "block rounded-md px-3 py-2 text-sm bg-sidebar-accent text-sidebar-accent-foreground font-medium",
                  }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { data: me, isLoading } = useCurrentUser();
  const signOut = useSignOut();
  const [open, setOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface px-6">
        <div className="w-full max-w-sm space-y-3">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    );
  }

  if (me && !me.isActive) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface px-6">
        <div className="max-w-md text-center">
          <h1 className="display-md">Akun belum aktif</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Akun Anda telah dinonaktifkan atau belum diaktifkan oleh administrator. Silakan hubungi
            Super Admin NTB-PIS.
          </p>
          <Button className="mt-6" variant="outline" onClick={() => void signOut()}>
            Keluar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-sidebar px-4 py-6 md:flex">
        <Link to="/" className="mb-8 flex items-center gap-3 px-3 text-sidebar-foreground">
          <NtbMark className="h-8 w-8" />
          <span className="font-display text-base font-semibold">NTB-PIS</span>
        </Link>
        <NavList />
        <div className="mt-auto px-3 pt-6 text-xs text-sidebar-foreground/50">
          Data agregat tingkat wilayah
        </div>
      </aside>

      <div className="md:pl-64">
        <header className="flex items-center gap-4 border-b border-border bg-background px-4 py-3 md:px-8">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Buka navigasi">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-sidebar px-4 py-6">
              <SheetTitle className="mb-6 flex items-center gap-3 px-3 text-sidebar-foreground">
                <NtbMark className="h-7 w-7" />
                <span className="font-display text-base">NTB-PIS</span>
              </SheetTitle>
              <NavList onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{me?.namaLengkap}</p>
            <p className="truncate text-xs text-muted-foreground">
              {me?.role ? ROLE_LABELS[me.role] : "Peran belum ditetapkan"}
              {me?.wilayahScopeNama ? ` · ${me.wilayahScopeNama}` : ""}
            </p>
          </div>

          <Button variant="outline" size="sm" onClick={() => void signOut()}>
            Keluar
          </Button>
        </header>

        <main className="px-4 py-8 md:px-8">{children}</main>
      </div>
    </div>
  );
}
