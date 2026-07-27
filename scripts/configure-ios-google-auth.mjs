import "dotenv/config";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const clientId = process.env.GOOGLE_IOS_CLIENT_ID;

if (!clientId?.endsWith(".apps.googleusercontent.com")) {
  throw new Error(
    "GOOGLE_IOS_CLIENT_ID must be set to the iOS OAuth client ID in .env"
  );
}

const reversedClientId = `com.googleusercontent.apps.${clientId.replace(
  ".apps.googleusercontent.com",
  ""
)}`;
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const plistPath = path.resolve(
  scriptDirectory,
  "../ios/App/App/Info.plist"
);
const plistBuddy = "/usr/libexec/PlistBuddy";

function plist(command, allowFailure = false) {
  try {
    execFileSync(plistBuddy, ["-c", command, plistPath], {
      stdio: allowFailure ? "ignore" : "inherit",
    });
  } catch (error) {
    if (!allowFailure) throw error;
  }
}

plist("Delete :GIDClientID", true);
plist("Delete :CFBundleURLTypes", true);
plist(`Add :GIDClientID string ${clientId}`);
plist("Add :CFBundleURLTypes array");
plist("Add :CFBundleURLTypes:0 dict");
plist("Add :CFBundleURLTypes:0:CFBundleURLSchemes array");
plist(`Add :CFBundleURLTypes:0:CFBundleURLSchemes:0 string ${reversedClientId}`);

console.log("Configured native Google Sign-In for iOS.");
