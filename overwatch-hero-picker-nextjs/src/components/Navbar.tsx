'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleNavbar = () => setIsOpen(!isOpen);

  return (
    <nav className="bg-gray-800 min-h-[5vh] px-4">
      <div className="flex items-center justify-between h-16">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center space-x-2 text-white hover:text-white no-underline"
        >
          <Image
            src="/assets/imgs/navbar/ow2-logo.png"
            alt="Overwatch 2 Logo"
            width={40}
            height={40}
            className="max-h-8"
            unoptimized
          />
          <span className="text-2xl font-overwatch">
            Overwatch 2 Hero Picker
          </span>
        </Link>

        {/* Mobile menu button */}
        <button
          type="button"
          className="lg:hidden text-white hover:text-gray-300 focus:outline-none focus:text-gray-300"
          onClick={toggleNavbar}
          aria-label="Toggle navigation menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
            />
          </svg>
        </button>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex space-x-4">
          <Link
            href="/about"
            className={`text-xl text-white hover:text-gray-300 no-underline px-3 py-2 ${pathname === '/about' ? 'font-bold' : ''}`}
          >
            About
          </Link>
          <a
            href="https://github.com/andrerfcsantos/overwatch-hero-picker"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xl text-white hover:text-gray-300 no-underline px-3 py-2"
          >
            Github
          </a>
          <a
            href="https://discord.gg/rwQMrCa"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2"
          >
            <Image
              src="/assets/imgs/discord.png"
              alt="Discord"
              width={24}
              height={24}
              className="h-6"
              unoptimized
            />
          </a>
          <a
            href="https://www.buymeacoffee.com/heropickers"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2"
          >
            <Image
              src="/assets/imgs/navbar/bmc.svg"
              alt="Buy me a coffee"
              width={24}
              height={24}
              className="h-6"
              unoptimized
            />
          </a>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={`lg:hidden ${isOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link
            href="/about"
            className={`block text-xl text-white hover:text-gray-300 no-underline px-3 py-2 ${pathname === '/about' ? 'font-bold' : ''}`}
            onClick={() => setIsOpen(false)}
          >
            About
          </Link>
          <a
            href="https://github.com/andrerfcsantos/overwatch-hero-picker"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-xl text-white hover:text-gray-300 no-underline px-3 py-2"
            onClick={() => setIsOpen(false)}
          >
            Github
          </a>
          <a
            href="https://discord.gg/rwQMrCa"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-3 py-2"
            onClick={() => setIsOpen(false)}
          >
            <Image
              src="/assets/imgs/discord.png"
              alt="Discord"
              width={24}
              height={24}
              className="h-6"
              unoptimized
            />
            <span className="text-white">Discord</span>
          </a>
          <a
            href="https://www.buymeacoffee.com/heropickers"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-3 py-2"
            onClick={() => setIsOpen(false)}
          >
            <Image
              src="/assets/imgs/navbar/bmc.svg"
              alt="Buy me a coffee"
              width={24}
              height={24}
              className="h-6"
              unoptimized
            />
            <span className="text-white">Buy me a coffee</span>
          </a>
        </div>
      </div>
    </nav>
  );
}
