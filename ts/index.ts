import { MDirectory, root } from "./fs.ts";

function initFileSystem() {
  let visitorHome = new MDirectory("visitor", new MDirectory("home", root));
}

initFileSystem();
