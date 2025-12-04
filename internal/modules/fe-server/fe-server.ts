import { serveDir } from 'https://deno.land/std@0.224.0/http/file_server.ts'
import constants from '../../../shared/constants.json' with { type: "json" }

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

]

Deno.serve(async (req) => {
  const url = new URL(req.url);
  if(url.pathname === '/' || REMOTE_PATTERNS.some(pattern => url.pathname.includes(pattern))) {
    try {
      if (req.method === 'POST') {
        try {
          console.log('POST request')
          console.log(url)
          console.log(url.pathname)
          console.log(JSON.stringify(req.body))
          const headers = new Headers(req.headers);
          headers.set('x-forwarded-proto', 'https');
          headers.set('x-forwarded-host', 'localhost');
          console.log(headers)
          const proxied = await fetch(REMOTE_INDEX_URL + url.pathname, {
            ...req,
            headers: {
              ...headers,
              'cross-origin-resource-policy': 'cross-origin',
              'access-control-allow-origin': '*',
            },
            credentials: 'include',
          });

          console.log('Proxied response:', proxied);

          return new Response(proxied.body, {
            status: proxied.status,
            headers: {
              ...proxied.headers,
              'Cross-Origin-Resource-Policy': 'cross-origin',
              'Access-Control-Allow-Origin': '*',
            },
          });
        } catch (err) {
          console.error('Failed to proxy POST request:', err);
          return new Response('Failed to proxy POST request', { status: 502 });
        }
      }
      const remoteResponse = await fetch(REMOTE_INDEX_URL + url.pathname);

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
})

