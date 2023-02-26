import dev from "aleph/dev";


Deno.env.set("APP_ENV", "DEV")

dev({
  baseUrl: import.meta.url,
  // To generate the `./routes/_export.ts` module for serverless env
  // that doesn't support dynamic import.
  generateExportTs: true,
});
