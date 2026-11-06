export default function Footer() {
  return (
    <footer className="text-gray-500 mt-4 lg:mt-0 max-[1220px]:mt-20">
      <div className="container mx-auto text-center">
        <p className="text-[1.25em] mb-1">
          <small>
            This is a fan-site for Overwatch and it is not in any way associated
            with Blizzard Entertainment. Part of{" "}
            <a
              href="https://heropickers.com"
              target="_blank"
              rel="noopener"
              className="text-gray-400 hover:text-gray-300"
            >
              Hero Pickers
            </a>
          </small>
        </p>
      </div>
    </footer>
  );
}
