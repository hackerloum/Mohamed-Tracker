"use client";

import { Drawer } from "vaul";
import type { ReactNode } from "react";

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: ReactNode;
}

export function Sheet({ open, onOpenChange, title, description, children }: SheetProps) {
  if (!title) {
    return (
      <Drawer.Root open={open} onOpenChange={onOpenChange}>
        {children}
      </Drawer.Root>
    );
  }

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-lg bg-bg-raised pb-[env(safe-area-inset-bottom)] outline-none">
          <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-hairline" />
          <Drawer.Title className="px-5 pb-2 pt-4 text-lg text-ink">{title}</Drawer.Title>
          {description ? (
            <Drawer.Description className="px-5 pb-2 text-sm text-ink-muted">
              {description}
            </Drawer.Description>
          ) : null}
          <div className="max-h-[80vh] overflow-y-auto px-5 pb-6">{children}</div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

export function SheetContent({ children }: { children: ReactNode }) {
  return (
    <Drawer.Portal>
      <Drawer.Overlay className="fixed inset-0 z-40 bg-black/40" />
      <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col rounded-t-[28px] bg-bg-raised outline-none">
        <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-hairline" />
        {children}
      </Drawer.Content>
    </Drawer.Portal>
  );
}

export const SheetTitle = Drawer.Title;
export const SheetDescription = Drawer.Description;
