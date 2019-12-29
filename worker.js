const ipPtr = require("ip-ptr");

addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request));
});

// https://www.beyondjava.net/elvis-operator-aka-safe-navigation-javascript-typescript
function safe(obj) {
  return new Proxy(obj, {
    get: function(target, name) {
      const result = target[name];
      if (!!result) {
        return result instanceof Object ? safe(result) : result;
      }
      return safe({});
    }
  });
}

async function handleRequest(request) {
  let cf = request.cf || {};
  let ip = request.headers.get("CF-Connecting-IP");
  let name = ipPtr(ip);
  let reverse = new Request(
    "https://cloudflare-dns.com/dns-query?name=" +
      name +
      "&type=PTR&ct=application/dns-json"
  );
  let response = await fetch(reverse);

  let json = await response.json();
  let records = json.hasOwnProperty("Answer")
    ? json.Answer.map(x => x.data)
    : [];

  let org;
  if (cf.asn) {
    let ripe = await fetch(
      "https://rest.db.ripe.net/search.json?query-string=AS" + cf.asn
    );
    org = safe(
      await ripe.json()
    ).objects.object[2].attributes.attribute[1].value.toString();
  }

  let locale = "en-US";
  let currentDate = new Date();
  let currentDateDay = currentDate.toLocaleString(locale, { day: "numeric" });
  let currentDateMonth = currentDate.toLocaleString(locale, { month: "long" });
  let currentDateYear = currentDate.toLocaleString(locale, { year: "numeric" });
  let currentDateHour = currentDate.toLocaleString(locale, {
    hour: "2-digit",
    hour12: false
  });
  let currentDateMinute = currentDate.toLocaleString(locale, {
    minute: "2-digit"
  });
  let currentDateSecond = currentDate.toLocaleString(locale, {
    second: "2-digit"
  });
  let currentDateMs = currentDate.getUTCMilliseconds();
  let currentDateTimeZone = currentDate.getTimezoneOffset() == 0 ? "UTC" : "?";
  // Example: 2 January 2018, 03:04:05.678 (UTC)
  let currentDateString =
    currentDateDay +
    " " +
    currentDateMonth +
    " " +
    currentDateYear +
    ", " +
    currentDateHour +
    ":" +
    currentDateMinute +
    ":" +
    currentDateSecond +
    "." +
    currentDateMs +
    " (" +
    currentDateTimeZone +
    ")";

  let body = `
<!DOCTYPE html><html lang="en"><head><title>ip: ${ip}</title></head><body>
<pre>
${ip}
${records.join("\n")}
<a href="https://apps.db.ripe.net/db-web-ui/#/query?searchtext=AS${cf.asn}">AS${
    cf.asn
  }</a> (${org})
Country: ${cf.country}
<a href="https://support.cloudflare.com/hc/en-us/articles/203118044#h_22b01241-01a5-4bed-a897-6e97cff5c288">Data center</a>: ${
    cf.colo
  }
${cf.tlsVersion} (${cf.tlsCipher})
${currentDateString}
</pre>
</body></html>`;

  let headers = {
    "Content-type": "text/html"
  };

  return new Response(body, { status: 200, headers: headers });
}
