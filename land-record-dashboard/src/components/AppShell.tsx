import { useState, type ReactNode } from "react";
import { House, LayoutDashboard, Search, ScanLine, FilePen, Camera, Map, Download, Settings, ChevronDown } from "lucide-react";
import logoUrl from "../assets/image.png";

interface AppShellProps {
  children: ReactNode;
  currentView: string;
  onNavigate: (view: string) => void;
}

const navGroups = [
  {
    label: "Overview",
    items: [
      { id: "home",      label: "Home",      Icon: House           },
      { id: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
    ],
  },
  {
    label: "Records",
    items: [
      { id: "search",   label: "Search",   Icon: Search },
      { id: "map-view", label: "Map View", Icon: Map    },
    ],
  },
  {
    label: "Add Record",
    items: [
      { id: "camera",  label: "Camera Capture",  Icon: Camera   },
      { id: "upload",  label: "Upload + OCR",    Icon: ScanLine },
      { id: "manual",  label: "Manual Template", Icon: FilePen  },
    ],
  },
  {
    label: "System",
    items: [
      { id: "export",   label: "Export",   Icon: Download },
      { id: "settings", label: "Settings", Icon: Settings },
    ],
  },
];

export function AppShell({ children, currentView, onNavigate }: AppShellProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  function toggle(label: string) {
    setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }));
  }

  return (
    <div className="h-screen flex flex-col bg-white text-black">
      {/* Header */}
      <div className="shrink-0 border-b border-neutral-200 pl-5 pr-6 py-3 bg-white flex items-center gap-4">
        <img src={logoUrl} alt="Ministry of Lands seal" style={{ height: 47, width: 47, objectFit: "contain", flexShrink: 0 }} />
        <div>
          <h1 className="text-xl font-semibold tracking-tight leading-tight">
            Certificate of Occupancy Records
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Ministry of Lands, Regional Government and Religious Affairs · Republic of The Gambia
          </p>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-54 shrink-0 border-r border-neutral-200 flex flex-col overflow-y-auto">
          <nav className="flex-1 p-3 space-y-6">
            {navGroups.map(({ label, items }) => {
              const isCollapsed = collapsed[label] ?? false;
              return (
                <div key={label}>
                  <button
                    onClick={() => toggle(label)}
                    className="w-full flex items-center gap-1.5 px-3 mb-1 cursor-pointer group"
                  >
                    <span style={{ fontSize: 10, fontWeight: 600, color: "#737373", textTransform: "uppercase", flex: 1, textAlign: "left" }}>{label}</span>
                    <ChevronDown
                      size={12}
                      strokeWidth={2.5}
                      className="text-neutral-300 group-hover:text-neutral-400 transition-transform duration-200"
                      style={{ transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}
                    />
                  </button>
                  {!isCollapsed && (
                    <div className="space-y-0.5">
                      {items.map(({ id, label: itemLabel, Icon }) => (
                        <button
                          key={id}
                          onClick={() => onNavigate(id)}
                          style={{ fontSize: 13.5 }}
                          className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-1 text-left cursor-pointer transition-colors
                            ${currentView === id
                              ? "bg-neutral-200 text-black font-medium"
                              : "text-neutral-500 font-medium hover:bg-neutral-100 hover:text-black"
                            }`}
                        >
                          <Icon size={15} strokeWidth={1.8} />
                          {itemLabel}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

          </nav>
        </aside>

        <main className="flex-1 overflow-y-auto p-5">{children}</main>
      </div>
    </div>
  );
}
