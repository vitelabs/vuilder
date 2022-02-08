import { exec, execSync } from "child_process";
import { name as packageName } from "../package.json";
import fs from "fs";

const defaultBinPath = `node_modules/${packageName}/bin/`;
// const binPath = `bin/`;

export async function init({
  name = "gvite",
  version,
  type = "bin",
}: {
  name?: String;
  version: String;
  type?: String;
}) {
  let binFileName = await binName(name, version);
  if (fs.existsSync(binPath() + binFileName)) {
    return;
  }
  const platform = process.platform;
  if (!["linux", "darwin"].includes(platform)) {
    console.log(`${platform} is not supported`);
    return;
  }
  const result = execSync(`./init.sh  ${version} ${platform}`, {
    cwd: binPath(),
    encoding: "utf8",
  });
  console.log(result);
}

export function binName(name: String, version: String) {
  const binName = `${name}-${version}`;
  return binName;
}

export function binPath() {
  return defaultBinPath;
}
// init({ version: "v2.11.1" }).then(function() {
//   console.log("done");
// });
