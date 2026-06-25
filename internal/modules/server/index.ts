// @ts-ignore
import { Application, Router, Status, send } from 'https://deno.land/x/oak@v12.6.1/mod.ts';
// import stub from './controllers/stub.ts'
import Logger from '../../../modules/logger/internal/logger.ts'
import { RouterContext } from 'https://deno.land/x/oak@v12.6.1/router.ts'
import Storage from '../../../modules/storage/internal/storage.ts'
import { getHead } from './controllers/git.ts'
import { getProjectInfo } from './controllers/project-info.ts'
import sh from '../../../modules/sh/internal/sh.ts'
import constants from '../../../shared/constants.json' with { type: "json" }

const router = new Router();

// router.get('/static/dist/:filename', async (context) => {
//   const filename = context.params.filename;
//
//   if (!filename) {
//     context.response.status = Status.BadRequest;
//     context.response.body = 'Filename is required';
//     return;
//   }
//
//   await send(context, filename, {
//     root: `${Deno.cwd()}/external/${constants.DIST_PATH}`,
//   })
// })
//
// router.get('/stub/:path', (context: RouterContext<any>) => {
//
//   context.response.type = 'json';
//   try {
//     context.response.status = Status.OK
//     console.log('context path', context.params.path)
//     const stubJSON = stub(context.params.path)
//     context.response.body = stubJSON;
//     context.response.headers.set('Access-Control-Allow-Origin', '*')
//     context.response.headers.set('Content-Type', 'application/json')
//   } catch(e) {
//     context.response.status = Status.InternalServerError
//     console.log(e)
//   }
// })

router.post('/storage/log/:key', async (context) => {
  context.response.type = 'json';
  const logger = new Logger()
  try {
    const body = JSON.parse(await context.request.body().value)
    context.response.status = Status.OK
    context.response.headers.set('Access-Control-Allow-Origin', '*')
    context.response.headers.set('Content-Type', 'application/json')
    await logger.log(context.params.key, body)
  } catch(e) {
    context.response.status = Status.InternalServerError
    console.log(e)
  } finally {
    logger.close()
  }
})

router.post('/storage/set/:key', async (context) => {
  context.response.type = 'json';
  const storage = new Storage()
  try {
    const value = await (await context.request.body()).value
    let body
    try {
      body = JSON.parse(value)
    } catch(e) {
      body = value
    }
    context.response.status = Status.OK
    await storage.store(String(context.params.key).split('.'), body)
    context.response.headers.set('Access-Control-Allow-Origin', '*')
    context.response.headers.set('Content-Type', 'application/json')
  } catch(e) {
    context.response.status = Status.InternalServerError
    console.log(e)
  } finally {
    storage.close()
  }
})

router.get('/storage/clear/:key', async (context) => {
  context.response.type = 'json';
  const storage = new Storage()
  try {
    context.response.status = Status.OK
    context.response.headers.set('Access-Control-Allow-Origin', '*')
    context.response.headers.set('Content-Type', 'application/json')
    await storage.delete([context.params.key])
  } catch(e) {
    context.response.status = Status.InternalServerError
    console.log(e)
  } finally {
    storage.close()
  }
})

router.get('/storage/get/:key', async (context) => {
  context.response.type = 'json';
  const storage = new Storage()
  try {
    context.response.status = Status.OK
    context.response.body =  await storage.get(String(context.params.key).split('.')) || {}
    context.response.headers.set('Access-Control-Allow-Origin', '*')
    context.response.headers.set('Content-Type', 'application/json')
  } catch(e) {
    context.response.status = Status.InternalServerError
    console.log(e)
  } finally {
    storage.close()
  }
})

router.get('/git/summary', async (context) => {
  context.response.type = 'json';
  try {
    const commit = await getHead()
    context.response.status = Status.OK
    context.response.body = commit
    context.response.headers.set('Access-Control-Allow-Origin', '*')
    context.response.headers.set('Content-Type', 'application/json')
  } catch(e) {
    context.response.status = Status.InternalServerError
    console.log(e)
  }
})

router.get('/project-info', async (context) => {
  context.response.type = 'json';
  try {
    const projectInfo = await getProjectInfo()
    context.response.status = Status.OK
    context.response.body = projectInfo
    context.response.headers.set('Access-Control-Allow-Origin', '*')
    context.response.headers.set('Content-Type', 'application/json')
  } catch(e) {
    context.response.status = Status.InternalServerError
    console.log(e)
  }
})

router.get('/sh/:command', async (context) => {
  try {
    const stdout = await sh(context.params.command)
    context.response.type = 'text';
    context.response.status = Status.OK
    context.response.body = stdout
    context.response.headers.set('Access-Control-Allow-Origin', '*')
    context.response.headers.set('Content-Type', 'text/plain')
  } catch(e) {
    context.response.status = Status.InternalServerError
    console.log(e)
  }
})

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

console.log('listening on port 8080')
app.listen({ hostname: '127.0.0.1', port: 8080 });