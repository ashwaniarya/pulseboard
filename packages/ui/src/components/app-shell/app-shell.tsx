import { useState, type ReactNode } from "react";

import { classNames } from "../../lib/class-names";
import { Dialog, DialogContent, DialogTitle } from "../dialog/dialog";
import { IconButton } from "../icon-button/icon-button";
import { VisuallyHidden } from "../visually-hidden/visually-hidden";

export function PulseBrandMark({ className }: { className?: string }) {
  return (
    <span className={classNames("flex items-center gap-2", className)}>
      <span className="grid size-7 place-items-center rounded-medium bg-accent text-accent-foreground">
        <svg aria-hidden viewBox="0 0 20 20" className="w-4.5" fill="none">
          <path
            d="M1.5 10h3.2l2-4.5 3 9 2.4-6.5 1.4 2h4.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="text-base font-semibold tracking-tight text-text-primary">Pulseboard</span>
    </span>
  );
}

export interface SidebarProps {
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function Sidebar({ children, footer, className }: SidebarProps) {
  return (
    <div className={classNames("flex h-full flex-col gap-6 p-4", className)}>
      <PulseBrandMark className="px-2" />
      <nav aria-label="Primary" className="flex flex-1 flex-col gap-1">
        {children}
      </nav>
      {footer !== undefined && <div className="px-2">{footer}</div>}
    </div>
  );
}

export interface SidebarNavItemProps {
  label: string;
  icon?: ReactNode;
  isActive?: boolean;
  renderLink?: (linkProps: {
    className: string;
    children: ReactNode;
    "aria-current"?: "page";
  }) => ReactNode;
  href?: string;
}

export function SidebarNavItem({
  label,
  icon,
  isActive = false,
  renderLink,
  href = "#",
}: SidebarNavItemProps) {
  const linkClassName = classNames(
    "flex items-center gap-2.5 rounded-medium px-2.5 py-2 text-sm font-medium transition-colors duration-150",
    isActive
      ? "bg-surface-sunken text-text-primary"
      : "text-text-muted hover:bg-surface-sunken/60 hover:text-text-primary",
  );
  const content = (
    <>
      {icon !== undefined && (
        <span aria-hidden className={classNames("text-current", isActive && "text-accent")}>
          {icon}
        </span>
      )}
      {label}
    </>
  );
  if (renderLink !== undefined) {
    return renderLink({
      className: linkClassName,
      children: content,
      ...(isActive ? { "aria-current": "page" as const } : {}),
    });
  }
  return (
    <a href={href} className={linkClassName} aria-current={isActive ? "page" : undefined}>
      {content}
    </a>
  );
}

export interface TopbarProps {
  children?: ReactNode;
  className?: string;
}

export function Topbar({ children, className }: TopbarProps) {
  return (
    <div
      className={classNames(
        "flex min-h-14 flex-wrap items-center gap-2 border-b border-outline bg-surface-raised/80 px-4 py-2 backdrop-blur",
        className,
      )}
    >
      {children}
    </div>
  );
}

export interface AppShellProps {
  sidebar: ReactNode;
  topbar?: ReactNode;
  banner?: ReactNode;
  children: ReactNode;
}

export function AppShell({ sidebar, topbar, banner, children }: AppShellProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  return (
    <div className="flex h-dvh bg-surface text-text-primary">
      <a
        href="#main-content"
        className="absolute left-2 top-2 z-50 -translate-y-16 rounded-medium bg-accent px-3 py-2 text-sm font-medium text-accent-foreground transition-transform focus-visible:translate-y-0"
      >
        Skip to content
      </a>
      <aside className="hidden w-60 shrink-0 border-r border-outline bg-surface-raised md:block">
        {sidebar}
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar>
          <span className="md:hidden">
            <IconButton
              label="Open navigation"
              onClick={() => {
                setIsDrawerOpen(true);
              }}
            >
              <svg aria-hidden viewBox="0 0 18 18" width="18" height="18" fill="none">
                <path
                  d="M2 4.5h14M2 9h14M2 13.5h14"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </IconButton>
          </span>
          {topbar}
        </Topbar>
        {banner}
        <main id="main-content" className="min-w-0 flex-1 overflow-y-auto dot-grid-canvas">
          {children}
        </main>
      </div>
      <Dialog open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DialogContent
          className="bottom-0 left-0 top-0 h-full w-72 max-w-[85vw] translate-x-0 translate-y-0 rounded-none border-r p-0"
          onClick={(event) => {
            const target = event.target;
            if (target instanceof HTMLElement && target.closest("a") !== null) {
              setIsDrawerOpen(false);
            }
          }}
        >
          <VisuallyHidden>
            <DialogTitle>Navigation</DialogTitle>
          </VisuallyHidden>
          {sidebar}
        </DialogContent>
      </Dialog>
    </div>
  );
}
