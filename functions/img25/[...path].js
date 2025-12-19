export async function onRequest({ request }) {
  const url = new URL(request.url);
  // url.pathname 形如：/img25/bb12.jpg
  const path = url.pathname.replace(/^\/+/, ""); // img25/bb12.jpg

  const upstream = `https://raw.githubusercontent.com/Ced464/img-lvoe/main/${path}`;

  // 转发 Range 头（有些渲染/预览会用到）
  const range = request.headers.get("Range");
  const init = { headers: {} };
  if (range) init.headers["Range"] = range;

  const resp = await fetch(upstream, init);

  const headers = new Headers(resp.headers);
  headers.set("Access-Control-Allow-Origin", "*");

  // 关键：不要缓存 404（避免“刚上传 404 被记住”）
  if (resp.status === 200 || resp.status === 206) {
    headers.set("Cache-Control", "public, max-age=86400, immutable");
  } else {
    headers.set("Cache-Control", "no-store");
  }

  return new Response(resp.body, { status: resp.status, headers });
}
