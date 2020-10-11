# ip

Install Node and dependencies

    brew install node
    npm install

Install [Rust]

    brew install rust

Install [Wrangler]

    cargo install wrangler

Use [Wrangler] to

- Build

        wrangler build

- Preview (opens browser)

        wrangler preview
        wrangler preview --watch

- Publish

        wrangler publish

Format the code with [Prettier]:

    npm run format

[Rust]: https://www.rust-lang.org/
[Wrangler]: https://github.com/cloudflare/wrangler
[Prettier]: https://prettier.io/
