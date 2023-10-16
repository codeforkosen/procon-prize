import { Server } from "https://js.sabae.cc/Server.js";
import { JSONDB } from "https://js.sabae.cc/JSONDB.js";
import { Ed25519 } from "https://code4fukui.github.io/Ed25519/Ed25519.js";
import { Base16 } from "https://code4fukui.github.io/Base16/Base16.js";

const bbs = new JSONDB("bbs.json");

const verify = (did, text, sign) => {
  const message = new TextEncoder().encode(text);
  //const signature = Ed25519.sign({ privateKey: user.secret, message, encodeing: "binary" });
  const chk = Ed25519.verify({ signature: Base16.decode(sign), publicKey: Base16.decode(did), message, encoding: "binary" });
  //console.log(chk);
  return chk;
};

class MyServer extends Server {
  api(path, req) {
    if (path == "/api/list") {
      return bbs.data;
    } else if (path == "/api/add") {
      try {
        if (req.sign) {
          if (!verify(req.did, req.body + "\n" + req.date, req.sign)) {
            throw new Error("illegal sign");
          }
        }
        const type = req.type;
        const num = req.num;
        const topic = bbs.data.find(d => d.type == type && d.num == num);
        if (!topic) {
          bbs.data.push({ type, num, items: [req] });
        } else {
          topic.items.push(req);
        }
        bbs.write();
        return "ok";
      } catch (e) {
        console.log(e);
        return e;
      }
    }
  }
}

const port = Deno.args[0] || 8001;
new MyServer(port);
