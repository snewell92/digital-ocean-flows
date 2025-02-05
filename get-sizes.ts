import { createApiClient } from "dots-wrapper";

// require SCALER_API_KEY
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      SCALER_API_KEY: string;
    }
  }
}

const dots = createApiClient({
  token: process.env.SCALER_API_KEY,
  endpoint: "https://api.digitalocean.com/v2/",
});

// ~142 total sizes last time I checked

const sizes = await dots.size.listSizes({ page: 0, per_page: 200 });

// redirect it to a txt to analyze/find with jq or something
// bun get-sizes.ts > sizes.json
console.info(JSON.stringify(sizes.data.sizes));
