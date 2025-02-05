import { sleep } from "bun";
import { createApiClient } from "dots-wrapper";
import type { IAction } from "dots-wrapper/dist/action";
import { parseArgs } from "util";

const { values } = parseArgs({
  args: Bun.argv,
  options: {
    size: {
      type: "string",
    },
  },
  allowPositionals: true,
});

const targetSize = values?.size?.toLowerCase() || "";

/** Polls the action until it is completed */
async function waitTillActionComplete(action: IAction) {
  // TODO actually will need to use actions :eyes: and v2!
  if (action.status != "completed") {
    let waiting = true;
    let newResponse = null;

    while (waiting) {
      await sleep(200);
      newResponse = await dots.action.getAction({ action_id: action.id });
      waiting = newResponse?.data?.action?.status != "completed";
    }
  }

  return;
}

const RESTING_SMOL_BOI = "s-2vcpu-4gb";
// Dedicated 8 core, 16Gb RAM machine
// Using a shared machine with minecraft has noisy-neighbor problem
const BIG_BOI = "c-8";

const targetSizeSlug = targetSize === "big" ? BIG_BOI : RESTING_SMOL_BOI;

console.info(`targetting ${targetSizeSlug}`);

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
console.info("DO api client created");

// we only have one minecraft droplet
const droplets = await dots.droplet.listDroplets({
  page: 1,
  per_page: 1,
  tag_name: "mc",
});
droplets.status;
if (droplets.status != 200 || droplets.data.droplets.length != 1) {
  console.debug(JSON.stringify(droplets.data));
  throw new Error(
    "No droplets with tag 'mc' found, status: " + droplets.status
  );
}
console.info("found target droplet");

const droplet = droplets.data.droplets[0];
const response = await dots.droplet.shutdownDroplet({ droplet_id: droplet.id });

if (response.status != 200 && response.status != 201) {
  throw new Error("Failed to shutdown the droplet");
}

console.info("shutdown droplet");

await sleep(500);

const resizeResponse = await dots.droplet.resizeDroplet({
  droplet_id: droplet.id,
  size: targetSizeSlug,
});

if (resizeResponse.status != 200 && resizeResponse.status != 201) {
  throw new Error("Failed to resize the droplet");
}

console.info("resized droplet, waiting 3s...");
await sleep(1000);
console.info("resized droplet, waiting 2s...");
await sleep(1000);
console.info("resized droplet, waiting 1s...");
await sleep(1000);

const powerOnResponse = await dots.droplet.powerOnDroplet({
  droplet_id: droplet.id,
});

if (powerOnResponse.status != 200 && powerOnResponse.status != 201) {
  throw new Error("Failed to turn on the droplet");
}
console.info("turned the droplet back on");
