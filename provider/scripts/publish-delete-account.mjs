import { copyFileSync, existsSync } from "node:fs";

const htmlFile = "dist/delete-account.html";
const prettyPath = "dist/delete-account";

if (!existsSync(htmlFile)) {
  throw new Error(`${htmlFile} was not produced by the Vite build.`);
}

// Render serves this file at /delete-account with HTTP 200 (not 404.html).
copyFileSync(htmlFile, prettyPath);
console.log("Published static delete-account page for Play Console.");
