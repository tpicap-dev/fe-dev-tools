// @ts-ignore
import { Application, Router, Status } from 'https://deno.land/x/oak@v12.6.1/mod.ts';
import stub from './controllers/stub.ts'
import Logger from '../../../modules/logger/internal/logger.ts'
import { RouterContext } from 'https://deno.land/x/oak@v12.6.1/router.ts'
import Storage from '../../../modules/storage/internal/storage.ts'

const router = new Router();
router.get('/stub/:path', (context: RouterContext<any>) => {

  context.response.type = 'json';
  try {
    context.response.status = Status.OK
    console.log('context path', context.params.path)
    const stubJSON = stub(context.params.path)
    context.response.body = stubJSON;
    context.response.headers.set('Access-Control-Allow-Origin', '*')
    context.response.headers.set('Content-Type', 'application/json')
  } catch(e) {
    context.response.status = Status.InternalServerError
    console.log(e)
  }
})

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

router.get('/storage/get/:key/:criteria', async (context) => {
  context.response.type = 'json';
  const logger = new Logger()
  try {
    const criteria = JSON.parse(context.params.criteria)
    console.log(criteria)
    context.response.status = Status.OK
    console.log(await logger.getEntry(context.params.key, criteria))
    console.log(criteria)
    context.response.body =  await logger.getEntry(context.params.key, criteria) || {}
    context.response.headers.set('Access-Control-Allow-Origin', '*')
    context.response.headers.set('Content-Type', 'application/json')
  } catch(e) {
    context.response.status = Status.InternalServerError
    console.log(e)
  } finally {
    logger.close()
  }
})

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

console.log('listening on port 8080')
app.listen({ port: 8080 });