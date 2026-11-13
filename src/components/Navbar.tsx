"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="bg-[#343a40] min-h-[5vh] flex flex-wrap items-center justify-between px-4 py-2 lg:px-6">
      <button
        className="lg:hidden text-white text-2xl border border-gray-500 rounded px-2 py-1 transition-[filter,transform] duration-150 ease-in-out hover:brightness-125 active:scale-95 active:brightness-90"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle navigation"
      >
        &#9776;
      </button>

      <div
        className={`${isOpen ? "flex" : "hidden"} lg:flex flex-col lg:flex-row w-full lg:w-auto items-start lg:items-center justify-between flex-1`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4">
          <Link
            href="/"
            prefetch={false}
            className="flex items-center no-underline text-white"
          >
            <Image
              className="h-[2em] w-auto pr-2"
              src="/assets/imgs/logo/hp-logo.webp"
              alt="Hero Picker logo"
              width={225}
              height={96}
            />
            <span className="text-[1.5rem] text-white">
              Overwatch Hero Picker
            </span>
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-3 lg:ml-6 text-[1.25em]">
            <Link
              href="/"
              prefetch={false}
              className={`nav-link ${pathname === "/" ? "nav-link-active" : ""}`}
            >
              Random Hero
            </Link>
            <Link
              href="/squad"
              prefetch={false}
              className={`nav-link ${pathname === "/squad" ? "nav-link-active" : ""}`}
            >
              Squad Generator
            </Link>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4 mt-2 lg:mt-0 text-[1.25em]">
          <Link
            href="/about"
            prefetch={false}
            className={`nav-link ${pathname === "/about" ? "nav-link-active" : ""}`}
          >
            About
          </Link>
          <a
            href="https://github.com/andrerfcsantos/overwatch-hero-picker"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link"
          >
            Github
          </a>
          <a
            href="https://discord.gg/rwQMrCa"
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
            href="https://www.buymeacoffee.com/heropickers"
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
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="nav-link cursor-pointer">Sign in</button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="nav-link cursor-pointer">Sign up</button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>
      </div>
    </nav>
  );
}
