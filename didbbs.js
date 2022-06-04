import { Server } from "https://js.sabae.cc/Server.js";
import { JSONDB } from "https://js.sabae.cc/JSONDB.js";
import { Ed25519 } from "https://code4fukui.github.io/Ed25519/Ed25519.js";
import { Text } from "https://code4fukui.github.io/Ed25519/Text.js";
import { DIDKey } from "https://code4fukui.github.io/Ed25519/DIDKey.js";

const port = Deno.args[0] || 8001;
const bbs = new JSONDB("bbs.json");

const checkSign = (did, body) => { // throws
  const publicKey = DIDKey.decode(did)?.data;
  if (!publicKey) {
    throw "no publicKey";
  }
  const sign = Text.extractSign(body);
  if (!sign) {
    throw "no sign";
  }
  const signature = DIDKey.decode(sign)?.data;
  if (!signature) {
    throw "sign not match";
  }
  console.log(signature);
  const message = Text.encode(Text.normalize(body));
  const chk = Ed25519.verify({ signature, publicKey, message, encoding: "binary" });
  if (!chk) {
    throw "illegal sign";
  }
};

class MyServer extends Server {
  api(path, req) {
    if (path == "/api/list") {
      return bbs.data;
    } else if (path == "/api/add") {
      try {
        console.log(req);
        const did = req.did;
        const body = req.body;
        checkSign(did, body);
        bbs.data.push(req);
        bbs.write();
        return "ok";
      } catch (e) {
        console.log(e);
        return e;
      }
    }
  }
}

new MyServer(port);
