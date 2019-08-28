const ipPtr = require("ip-ptr");

addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  let ip = request.headers.get("CF-Connecting-IP");
  let name = ipPtr(ip);
  let reverse = new Request(
    "https://dns.google/resolve?name=" + name + "&type=PTR"
  );
  let response = await fetch(reverse);
  let json = await response.json();
  let records = json.hasOwnProperty("Answer")
    ? json.Answer.map(x => x.data)
    : [];

  let body = ip + "\n" + records.join("\n");

  return new Response(body, { status: 200 });
}
