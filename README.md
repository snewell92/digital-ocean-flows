# digital-ocean-flows

Scale up / down your digital ocean droplet by tag.

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.2.1. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

## Use

Provide a .env file with your SCALER_API_KEY, you'll need to go into the "API"
section of Digital Ocean's Control Panel to create a personal access token.

```sh
bun index.ts --size BIG
```

And then to scale down

```sh
bun index.ts --size SMOL
```

Code is quite permissive, so "BIG" is the only string it looks for, otherwise you get smol size.
