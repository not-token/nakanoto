import { Integration } from "express-zod-api";
import fs from "node:fs/promises";
import { routing } from "../router.js";

await fs.writeFile(
  new URL("../../../web/src/api/generated.ts", import.meta.url),
  new Integration({
    routing,
    variant: "client",
    optionalPropStyle: { withQuestionMark: true, withUndefined: true },
  }).print({ removeComments: true, newLine: 1, omitTrailingSemicolon: true }),
  "utf-8",
);
