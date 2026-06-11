/*
components/Navbar.js | Top navbar with user menu | Sree | 2026-06-10
*/

/* - - - - - - - - - - - - - - - - */

"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, LogOut } from "lucide-react";
import { FxThemeToggle } from "@/components/FxThemeToggle";
import { NAVBAR_HEIGHT_CLASS, PAGE_PADDING_X_CLASS, ROUTES, STORAGE_KEYS } from "@/lib/FxConstants";

export function Navbar({ title }) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.AUTH_COMPLETE);
      window.dispatchEvent(new Event("fx-auth-change"));
    }
    setIsMenuOpen(false);
    router.replace(ROUTES.LANDING);
    router.refresh();
  }

  return (
    <header className={`sticky top-0 z-20 flex ${NAVBAR_HEIGHT_CLASS} items-center justify-between border-b border-border bg-background ${PAGE_PADDING_X_CLASS}`}>
      <h1 className="text-[20px] font-medium text-foreground">{title}</h1>

      <div className="flex items-center gap-[16px]">
        <FxThemeToggle />

        <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex h-[40px] w-[40px] cursor-pointer items-center justify-center rounded-[8px] bg-muted hover:bg-accent transition-all"
        >
          <User className="size-[20px] text-muted-foreground" />
        </button>

        {isMenuOpen && (
          <div className="absolute top-full right-0 mt-[8px] w-[160px] rounded-[8px] border border-border bg-background shadow-lg overflow-hidden z-50">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full cursor-pointer items-center gap-[12px] px-[16px] py-[12px] text-left text-sm text-foreground transition-all hover:bg-accent"
            >
              <LogOut className="size-[16px]" />
              Logout
            </button>
          </div>
        )}
        </div>
      </div>
    </header>
  );
}

/* - - - - - - - - - - - - - - - - */
