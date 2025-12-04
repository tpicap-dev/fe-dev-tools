import { serveDir } from 'https://deno.land/std@0.224.0/http/file_server.ts';
import constants from '../../../shared/constants.json' with { type: "json" };

const REMOTE_INDEX_URL = 'https://qa.tpicapfusion.com'

const REMOTE_PATTERNS = [
  'index.html',
  'app.',
  '/themes',
  'favicon',
  'fusion-compatibility.',
  'validateSession',
  'login',
  '500',
  '/api',
  'appd-snippet',
  'adrum',
  'polyfills',
  '.svg',
  '.woff',
  '/f2',
]

const PORT = 8443;
const HOST = '0.0.0.0';

console.log(`Serving ./dist over HTTPS at https://${HOST}:${PORT}/`);

Deno.serve(
  {
    hostname: HOST,
    port: PORT,
    cert: await Deno.readTextFile('./cert.pem'),
    key: await Deno.readTextFile('./key.pem')
  },
  async (req) => {
    const url = new URL(req.url);
    console.log(url)
    if(url.pathname === '/' || REMOTE_PATTERNS.some(pattern => url.pathname.includes(pattern))) {
      try {
        if (req.method === 'POST') {
          try {
            const proxied = await fetch(REMOTE_INDEX_URL + url.pathname + url.search, {
              method: 'POST',
              headers: req.headers,
              body: req.body,
              redirect: 'manual',
              credentials: 'include',
            });

            return new Response(proxied.body, {
              status: proxied.status,
              headers: proxied.headers,
            });
          } catch (err) {
            console.error('Failed to proxy POST request:', err);
            return new Response('Failed to proxy POST request', { status: 502 });
          }
        }

        if (url.pathname === '/f2') {
          console.log("url.pathname === '/f2'")
        }
        const remoteResponse = url.pathname === '/f2' ? await fetch(REMOTE_INDEX_URL + '/index.html') : await fetch(REMOTE_INDEX_URL + url.pathname);

        const body = remoteResponse.body ?
          remoteResponse.body :
          await remoteResponse.text();

        return new Response(body, {
          status: remoteResponse.status,
          headers: {
            'content-type': remoteResponse.headers.get('content-type') ?? 'text/html; charset=utf-8',
            'cache-control': 'no-store',
            'cross-origin-resource-policy': 'cross-origin',
            'access-control-allow-origin': '*',
          }
        })
      } catch (err) {
        console.error('Failed to fetch remote index:', err)
        return new Response('Failed to fetch remote file ' + url.pathname, { status: 502 })
      }
    }

    return serveDir(req, {
      root: `${constants.PROJECT_PATH}/${constants.DIST_PATH}`,
      enableCors: true,
      showDirListing: false,
    })
  }
);