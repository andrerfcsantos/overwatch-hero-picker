"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDesign } from "@/context/DesignContext";
import styles from "./Navbar.module.css";

const PRIMARY_LINKS = [
  { href: "/", label: "Random Hero" },
  { href: "/squad", label: "Squad Generator" },
];

const GITHUB_URL = "https://github.com/andrerfcsantos/overwatch-hero-picker";
const DISCORD_URL = "https://discord.gg/rwQMrCa";
const COFFEE_URL = "https://www.buymeacoffee.com/heropickers";

/** Position in the menu, read by the CSS to stagger the rows as it opens. */
function order(index: number): React.CSSProperties {
  return { "--i": index } as React.CSSProperties;
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { design, setDesign } = useDesign();
  const toggleRef = useRef<HTMLButtonElement>(null);
  // Every link in the menu takes the visitor somewhere, so it closes.
  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setIsOpen(false);
      toggleRef.current?.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  const switchDesign = () =>
    setDesign(design === "refresh" ? "classic" : "refresh", "nav");

  // Both labels ship in the static HTML and CSS shows the right one, so the
  // button never reads wrong while the page loads.
  const switchLabel = (
    <>
      <span className="only-classic">Try the new design</span>
      <span className="only-refresh">Classic design</span>
    </>
  );

  return (
    <>
      <div
        className={styles.backdrop}
        data-open={isOpen}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      <nav
        className={`site-nav ${styles.nav} bg-[#343a40] min-h-[5vh] flex items-center justify-between gap-3 px-4 py-2 lg:px-6`}
        aria-label="Main"
      >
        <div className="flex min-w-0 items-center gap-2 lg:gap-4">
          <Link
            href="/"
            prefetch={false}
            className="site-nav-brand flex min-w-0 items-center no-underline text-white"
            onClick={() => setIsOpen(false)}
          >
            <Image
              className="h-[2em] w-auto pr-2"
              src="/assets/imgs/logo/hp-logo.webp"
              alt="Hero Picker logo"
              width={225}
              height={96}
            />
            <span className="truncate text-[1.5rem] text-white">
              Overwatch Hero Picker
            </span>
          </Link>

          {/* The two pickers stay in the bar for as long as they fit; only
              below this width do they move into the menu. */}
          <div className="hidden md:flex items-center gap-3 ml-4 lg:ml-6 text-[1.25em]">
            {PRIMARY_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                prefetch={false}
                className={`nav-link whitespace-nowrap ${pathname === href ? "nav-link-active" : ""}`}
                aria-current={pathname === href ? "page" : undefined}
                onClick={() => setIsOpen(false)}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-4 text-[1.25em]">
          <button className="site-nav-switch" onClick={switchDesign}>
            {switchLabel}
          </button>
          <Link
            href="/about"
            prefetch={false}
            className={`nav-link ${pathname === "/about" ? "nav-link-active" : ""}`}
            aria-current={pathname === "/about" ? "page" : undefined}
          >
            About
          </Link>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link"
          >
            Github
          </a>
          <a
            href={DISCORD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link"
          >
            <Image
              className="h-[1.5em] w-auto"
              src="/assets/imgs/discord.webp"
              alt="Discord"
              width={24}
              height={24}
            />
          </a>
          <a
            href={COFFEE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link"
          >
            <Image
              className="h-[1.5em] w-auto"
              src="/assets/imgs/navbar/bmc.svg"
              alt="Buy Me a Coffee"
              width={150}
              height={42}
            />
          </a>
        </div>

        <button
          ref={toggleRef}
          className={styles.toggle}
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          aria-controls="site-nav-menu"
        >
          <span className={styles.toggleBars} aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>

        <div id="site-nav-menu" className={styles.panel} data-open={isOpen}>
          <ul className={`${styles.primary} md:hidden`}>
            {PRIMARY_LINKS.map(({ href, label }, index) => (
              <li key={href} style={order(index)}>
                <Link
                  href={href}
                  prefetch={false}
                  className={styles.row}
                  onClick={closeMenu}
                  aria-current={pathname === href ? "page" : undefined}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <ul className={styles.tiles}>
            <li style={order(2)}>
              <Link
                href="/about"
                prefetch={false}
                className={styles.tile}
                onClick={closeMenu}
                aria-current={pathname === "/about" ? "page" : undefined}
              >
                About
              </Link>
            </li>
            <li style={order(3)}>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.tile}
                onClick={closeMenu}
              >
                Github
              </a>
            </li>
            <li style={order(4)}>
              <a
                href={DISCORD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.tile}
                onClick={closeMenu}
              >
                <Image
                  className="h-[1.4em] w-auto"
                  src="/assets/imgs/discord.webp"
                  alt=""
                  width={24}
                  height={24}
                />
                Discord
              </a>
            </li>
            <li style={order(5)}>
              <a
                href={COFFEE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.tile}
                onClick={closeMenu}
              >
                <Image
                  className="h-[1.4em] w-auto"
                  src="/assets/imgs/navbar/bmc.svg"
                  alt="Buy Me a Coffee"
                  width={150}
                  height={42}
                />
              </a>
            </li>
            <li className={styles.wide} style={order(6)}>
              <button
                className={`site-nav-switch ${styles.switch}`}
                onClick={() => {
                  switchDesign();
                  setIsOpen(false);
                }}
              >
                {switchLabel}
              </button>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
