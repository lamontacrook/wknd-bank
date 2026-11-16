"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "./SiteHeader.module.css";

const NAV = ["Checking", "Savings", "Credit cards", "Home loans"];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const burger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        burger.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <div className={styles.utility}>
        <div className={`wrap ${styles.utilityInner}`}>
          <nav aria-label="Audience" className={styles.audience}>
            <a href="#" aria-current="page">Personal</a>
            <a href="#">Business</a>
          </nav>
          <span className={styles.utilityLinks}>
            <a href="#">Find a branch</a> · <a href="#">Help &amp; support</a>
          </span>
        </div>
      </div>
      <header className={styles.header} data-open={open || undefined}>
        <div className={`wrap ${styles.inner}`}>
          <Link className={styles.wordmark} href="/">
            WKND <span>Bank</span>
          </Link>
          <button
            ref={burger}
            type="button"
            className={styles.burger}
            aria-expanded={open}
            aria-controls="primary-nav"
            onClick={() => setOpen((o) => !o)}
          >
            Menu
          </button>
          <nav id="primary-nav" className={styles.nav} aria-label="Primary">
            {NAV.map((label) => (
              <a key={label} href="#accounts">{label}</a>
            ))}
          </nav>
          <div className={styles.actions}>
            <a className="link" href="#">Sign in</a>
            <a className="btn btn-primary" href="#open">Open an account</a>
          </div>
        </div>
      </header>
    </>
  );
}
