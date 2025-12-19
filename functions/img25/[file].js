export async function onRequest({ params, request }) {
  const file = params.file; // e.g. "bb12.jpg"
  const upstream = `https://raw.githubusercontent.com/Ced464/img-lvoe/main/img25/${file}`;

  const range = request.headers.get("Range");
  const init = { headers: {} };
  if (range) init.headers["Range"] = range;

  const resp = await fetch(upstream, init);

  const headers = new Headers(resp.headers);
  headers.set("Access-Control-Allow-Origin", "*");

  // 200/206 才缓存；其他一律不缓存，避免短暂 404 被记住
  if (resp.status === 200 || resp.status === 206) {
    headers.set("Cache-Control", "public, max-age=86400, immutable");
  } else {
    headers.set("Cache-Control", "no-store");
  }

  return new Response(resp.body, { status: resp.status, headers });
}
