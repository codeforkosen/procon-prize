import { Server } from "https://js.sabae.cc/Server.js";
import { JSONDB } from "https://js.sabae.cc/JSONDB.js";
import { checkSign } from "https://code4fukui.github.io/Ed25519/checkSign.js";

const bbs = new JSONDB("bbs.json");

class MyServer extends Server {
  api(path, req) {
    if (path == "/api/list") {
      return bbs.data;
    } else if (path == "/api/add") {
      try {
        checkSign(req.did, req.body);
        bbs.data.push(req);
        bbs.write();
        return "ok";
      } catch (e) {
        return e;
      }
    }
  }
}

const port = Deno.args[0] || 8001;
new MyServer(port);
