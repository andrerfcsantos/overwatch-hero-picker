import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About - Overwatch Hero Picker",
};

export default function AboutPage() {
  return (
    <div className="text-white flex flex-col max-w-full px-[20%] pt-8 mb-12 max-[1000px]:px-6">
      <h2 className="text-[rgb(248,158,74)] underline text-start">
        About this site
      </h2>

      <p className="about-text">
        When playing Overwatch, we all had those moments where we are unsure
        about which hero to play.
      </p>

      <p className="about-text">
        In those moments you may want a hero to be chosen for you! But more
        often than not, you don&apos;t want the hero chosen to be completely
        random. It would be nice if the random selection was between heroes you
        actually want to play.
      </p>

      <p className="about-text">
        That&apos;s where this site comes in. Using this hero picker you can
        select the heroes you want to play and get a random one from the
        selection. You can also use this site as a way to get new heroes to
        try/improve, a bit like the &quot;mystery heroes&quot; game mode.
      </p>

      <h2 className="text-[rgb(248,158,74)] underline text-start">
        Why another Hero Picker?
      </h2>

      <p className="about-text">
        There are several other random hero pickers/generators for Overwatch,
        but I found most of them too be either too simple - without the option
        to filter heroes - or too complicated. With this hero picker, I tried to
        make something simple but useful.
      </p>

      <h2 className="text-[rgb(248,158,74)] underline text-start">Discord</h2>

      <p className="about-text">
        Join the discord server:{" "}
        <a href="https://discord.gg/rwQMrCa">https://discord.gg/rwQMrCa</a>
      </p>

      <h2 className="text-[rgb(248,158,74)] underline text-start">
        Overwatch 1 Legacy Site
      </h2>

      <p className="about-text">
        The current site is for Overwatch which introduced new heroes and
        changed the role of some existing ones. If you want to access the site
        for Overwatch 1, it is still accessible at{" "}
        <a href="https://ow1.owheropicker.com">ow1.owheropicker.com</a>
      </p>

      <h2 className="text-[rgb(248,158,74)] underline text-start">Donate</h2>

      <p className="about-text">
        If you like this project, consider making a donation by clicking on the
        image below (or{" "}
        <a
          href="https://www.buymeacoffee.com/heropickers"
          target="_blank"
          rel="noopener noreferrer"
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
      >
        <img
          className="w-[20em]"
          src="/assets/imgs/navbar/bmc.svg"
          alt="Buy Me a Coffee"
        />
      </a>

      <h2 className="text-[rgb(248,158,74)] underline text-start">
        Contact me
      </h2>

      <p className="about-text">
        If you have feedback, suggestions, comments about the site or you just
        want to say something to me, reach out at heropickers [at] gmail [dot]
        com. You can also contact me via the{" "}
        <a href="https://discord.gg/rwQMrCa">discord server</a>.
      </p>

      <h2 className="text-[rgb(248,158,74)] underline text-start">
        Disclaimer
      </h2>

      <p className="about-text">
        This is a fan-site for Overwatch and it is not affiliated with Blizzard
        Entertainment. All rights belong to their respective owners. Below are
        the relevant copyright notices:
      </p>

      <h3 className="text-start font-bold text-base font-sans">
        Blizzard Entertainment&reg;
      </h3>
      <p className="about-text text-[0.9em] font-sans">
        &reg;2016 Blizzard Entertainment, Inc. All rights reserved. Overwatch is
        a trademark or registered trademark of Blizzard Entertainment, Inc. in
        the U.S. and/or other countries.
      </p>

      <h3 className="text-start font-bold text-base font-sans">
        Overwatch&trade;
      </h3>
      <p className="about-text text-[0.9em] font-sans">
        Overwatch&trade;&reg;2016 Blizzard Entertainment, Inc. All rights
        reserved. Overwatch is a trademark or registered trademark of Blizzard
        Entertainment, Inc. in the U.S. and/or other countries.
      </p>
    </div>
  );
}
