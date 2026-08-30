const fs = require("fs");
const path = require("path");

const file = path.join(
  __dirname,
  "..",
  "node_modules",
  "react-native-css-interop",
  "dist",
  "runtime",
  "components.js"
);

if (!fs.existsSync(file)) {
  process.exit(0);
}

const needle = '(0, api_1.cssInterop)(react_native_1.SafeAreaView, { className: "style" });';
let source = fs.readFileSync(file, "utf8");
if (!source.includes(needle)) {
  process.exit(0);
}

fs.writeFileSync(file, source.replace(`${needle}\n`, ""));
