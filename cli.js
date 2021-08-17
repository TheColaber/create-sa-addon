#! /usr/bin/env node

const path = require("path");

const [node, source, addonId] = process.argv;

const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (question) =>
  new Promise((resolve) => readline.question(question, resolve));

const fs = require("fs");

(async () => {
  let name = await question("Name: ");
  let id = (await question(`ID${addonId ? ` (${addonId})` : ""}:`)) || addonId;
  let description = await question("Description: ");
  let username = await question("Username: ");
  let tags = await question("Tags (separate with commas): ");
  let userscriptMatch = await question(
    "Userscript Matches (separate with commas, leave blank for no userscript): "
  );
  let userstyleMatch = await question(
    "Userstyle Matches (separate with commas, leave blank for no userstyle): "
  );
  readline.close();

  let dir = process.cwd() + path.sep + "addons" + path.sep + id;

  if (fs.existsSync(dir)) {
    if (fs.readdirSync(dir).length) {
      console.log(
        "\x1b[31m%s",
        "[Error] A folder with this addon ID already exists!",
        "\x1b[0m"
      );
      return;
    }
  } else fs.mkdirSync(dir);

  const addonJSON = {
    $schema:
      "https://raw.githubusercontent.com/ScratchAddons/manifest-schema/dist/schema.json",
    name,
    description,
    credits: [
      {
        name: username,
      },
    ],
    tags: tags.split(/,\s*/),
  };
  if (userscriptMatch) {
    addonJSON.userscripts = [
      {
        url: "userscript.js",
        matches: userscriptMatch.split(/,\s*/),
      },
    ];

    const userscriptJS = `export default async function ({ addon, msg, global, console }) {\n\n}\n`;
    fs.writeFileSync(dir + path.sep + "userscript.js", userscriptJS);
  }
  if (userstyleMatch) {
    addonJSON.userstyles = [
      {
        url: "userstyle.css",
        matches: userstyleMatch.split(/,\s*/),
      },
    ];
    fs.writeFileSync(dir + path.sep + "userstyle.css", "");
  }

  fs.writeFileSync(
    dir + path.sep + "addon.json",
    JSON.stringify(addonJSON, null, "  ") + "\n"
  );

  const addonsDir = process.cwd() + path.sep + "addons" + path.sep + "addons.json";
  let addonsJSON = fs.readFileSync(addonsDir, "utf8");
  const substringIndex = addonsJSON.indexOf("// NEW ADDONS ABOVE THIS ↑↑") - 5;
  addonsJSON =
    addonsJSON.substring(0, substringIndex) +
    `  "${id}",\n` +
    addonsJSON.substring(substringIndex, addonsJSON.length);

  fs.writeFileSync(addonsDir, addonsJSON);

  console.log("\x1b[34m%s", "Addon created:", dir, "\x1b[0m");
})();
