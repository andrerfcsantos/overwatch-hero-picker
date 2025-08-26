import Image from 'next/image';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About - Overwatch 2 Hero Picker',
  description: 'Learn more about the Overwatch 2 Random Hero Picker website',
};

export default function AboutPage() {
  return (
    <div className="flex flex-col max-w-full px-4 lg:px-80 py-8 mb-12 text-white">
      <h2 className="text-orange-400 underline text-left text-3xl mb-4">
        About this site
      </h2>

      <p className="text-left text-lg font-sans mb-4">
        When playing Overwatch, we all had those moments where we are unsure
        about which hero to play.
      </p>

      <p className="text-left text-lg font-sans mb-4">
        In those moments you may want a hero to be chosen for you! But more
        often than not, you don&apos;t want the hero chosen to be completely
        random. It would be nice if the random selection was between heroes you
        actually want to play.
      </p>

      <p className="text-left text-lg font-sans mb-6">
        That&apos;s where this site comes in. Using this hero picker you can
        select the heroes you want to play and get a random one from the
        selection. You can also use this site as a way to get new heroes to
        try/improve, a bit like the &quot;mystery heroes&quot; game mode.
      </p>

      <h2 className="text-orange-400 underline text-left text-3xl mb-4">
        Why another Hero Picker?
      </h2>

      <p className="text-left text-lg font-sans mb-6">
        There are several other random hero pickers/generators for Overwatch,
        but I found most of them too be either too simple - without the option
        to filter heroes - or too complicated. With this hero picker, I tried to
        make something simple but useful.
      </p>

      <h2 className="text-orange-400 underline text-left text-3xl mb-4">
        Discord
      </h2>

      <p className="text-left text-lg font-sans mb-6">
        Join the discord server:{' '}
        <a
          href="https://discord.gg/rwQMrCa"
          className="text-orange-500 underline hover:text-orange-600"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://discord.gg/rwQMrCa
        </a>
      </p>

      <h2 className="text-orange-400 underline text-left text-3xl mb-4">
        Overwatch 1 Legacy Site
      </h2>

      <p className="text-left text-lg font-sans mb-6">
        The current site is for Overwatch 2 which introduced new heroes and
        changed the role of some existing ones. If you want to access the site
        for Overwatch 1, it is still accessible at{' '}
        <a
          href="https://ow1.owheropicker.com"
          className="text-orange-500 underline hover:text-orange-600"
          target="_blank"
          rel="noopener noreferrer"
        >
          ow1.owheropicker.com
        </a>
      </p>

      <h2 className="text-orange-400 underline text-left text-3xl mb-4">
        Donate
      </h2>

      <p className="text-left text-lg font-sans mb-4">
        If you like this project, consider making a donation by clicking on the
        image below (or{' '}
        <a
          href="https://www.buymeacoffee.com/heropickers"
          target="_blank"
          rel="noopener noreferrer"
          className="text-orange-500 underline hover:text-orange-600"
        >
          here
        </a>
        )! You can choose to make a one-time donation or become a member and
        donate monthly/anually. The money will be used to cover the costs of
        keeping the site up, free for everyone and with no ads.
      </p>

      <a
        href="https://www.buymeacoffee.com/heropickers"
        target="_blank"
        rel="noopener noreferrer"
        className="mb-6"
      >
        <Image
          src="/assets/imgs/navbar/bmc.svg"
          alt="Buy me a coffee"
          width={320}
          height={80}
          className="w-80"
          unoptimized
        />
      </a>

      <h2 className="text-orange-400 underline text-left text-3xl mb-4">
        Contact me
      </h2>

      <p className="text-left text-lg font-sans mb-6">
        If you have feedback, suggestions, comments about the site or you just
        want to say something to me, reach out at heropickers [at] gmail [dot]
        com. You can also contact me via the{' '}
        <a
          href="https://discord.gg/rwQMrCa"
          className="text-orange-500 underline hover:text-orange-600"
          target="_blank"
          rel="noopener noreferrer"
        >
          discord server
        </a>
        .
      </p>

      <h2 className="text-orange-400 underline text-left text-3xl mb-4">
        Disclaimer
      </h2>

      <p className="text-left text-lg font-sans mb-4">
        This is a fan-site for Overwatch and it is not affiliated with Blizzard
        Entertainment. All rights belong to their respective owners. Below are
        the relevant copyright notices:
      </p>

      <h3 className="text-left text-xl font-bold font-sans mb-2">
        Blizzard Entertainment®
      </h3>
      <p className="text-left text-sm font-sans mb-4">
        ®2016 Blizzard Entertainment, Inc. All rights reserved. Overwatch is a
        trademark or registered trademark of Blizzard Entertainment, Inc. in the
        U.S. and/or other countries.
      </p>

      <h3 className="text-left text-xl font-bold font-sans mb-2">
        Overwatch™
      </h3>

      <p className="text-left text-sm font-sans mb-4">
        Overwatch™®2016 Blizzard Entertainment, Inc. All rights reserved.
        Overwatch is a trademark or registered trademark of Blizzard
        Entertainment, Inc. in the U.S. and/or other countries.
      </p>
    </div>
  );
}
