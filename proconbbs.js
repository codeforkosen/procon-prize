import { Server } from "https://js.sabae.cc/Server.js";
import { JSONDB } from "https://js.sabae.cc/JSONDB.js";
import { checkSign } from "https://code4fukui.github.io/Ed25519/checkSign.js";
import { CSV } from "https://js.sabae.cc/CSV.js";

const bbs = new JSONDB("bbs.json");

if (bbs.data.length == 0) {
  const url = "https://codeforkosen.github.io/kosen-opendata/data/procon/procon2022.csv"
  const data = await CSV.fetchJSON(url);
  console.log(data);
  let id = 1;
  data.forEach(d => {
    d.id = id++;
    d.items = [];
    bbs.data.push(d);
  });
  bbs.write();
}

class MyServer extends Server {
  api(path, req) {
    if (path == "/api/list") {
      return bbs.data;
    } else if (path == "/api/add") {
      try {
        console.log(req);
        //checkSign(req.did, req.body);
        const topic = bbs.data.find(d => d.id == req.id);
        console.log(topic);
        topic.items.push(req);
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
