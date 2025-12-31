import mongoose from "mongoose";
import config from "./env.js";
import User from "./models/User.js";

const users = [
  { username: "demo1", password: "MdPdemo1!", displayName: "Démo 1", role: "viewer" },
  { username: "demo2", password: "MdPdemo2!", displayName: "Démo 2", role: "viewer" },
  // ajoute ici
];

async function main() {
  await mongoose.connect(process.env.MONGO_Url || config.MONGO.Url);
  for (const u of users) {
    const existing = await User.findOne({ username: u.username });
    if (existing) { console.log("skip", u.username); continue; }
    const user = new User({ username: u.username, role: u.role, displayName: u.displayName });
    await user.setPassword(u.password);
    await user.save();
    console.log("créé", u.username);
  }
  await mongoose.disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
