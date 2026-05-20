import type { ReactNode } from "react";
import { House, LayoutDashboard, ScanLine, FilePen, Camera, Map } from "lucide-react";
import logoUrl from "../assets/image.png";

interface AppShellProps {
  children: ReactNode;
  currentView: string;
  onNavigate: (view: string) => void;
}

export function AppShell({ children, currentView, onNavigate }: AppShellProps) {
  const navItems = [
    { id: "home",      label: "Home",            Icon: House           },
    { id: "dashboard", label: "Dashboard",        Icon: LayoutDashboard },
    { id: "camera",    label: "Camera Capture",   Icon: Camera          },
    { id: "upload",    label: "Upload + OCR",     Icon: ScanLine        },
    { id: "manual",    label: "Manual Template",  Icon: FilePen         },
    { id: "map-view",  label: "Map View",         Icon: Map             },
  ];

  return (
    <div className="h-screen flex flex-col bg-white text-black">
      {/* Header */}
      <div className="shrink-0 border-b border-gray-200 px-6 py-3 bg-white flex items-center gap-4">
        <img src={logoUrl} alt="Ministry of Lands seal" style={{ height: 47, width: 47, objectFit: "contain", flexShrink: 0 }} />
        <div>
          <h1 className="text-xl font-semibold tracking-tight leading-tight">
            Certificate of Occupancy Records
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Ministry of Lands, Regional Government and Religious Affairs · Republic of The Gambia
          </p>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-54 shrink-0 border-r border-gray-200 p-4">
          <nav className="space-y-2">
            {navItems.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm ${
                  currentView === id
                    ? "bg-black text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon size={15} strokeWidth={1.8} />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 overflow-y-auto p-5">{children}</main>
      </div>
    </div>
  );
}
