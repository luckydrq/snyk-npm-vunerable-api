import Application from 'koa';
import Router from '@koa/router';
import bodyParser from 'koa-bodyparser';
import index from './index';
import vunerable from './vunerable';

const router = new Router();

function createApp() {
  const app = new Application();

  app.use(bodyParser());
  router.get('/', index);
  router.get('/:pkg/:version', vunerable);
  router.get('/:scope/:pkg/:version', vunerable);
  app.use(router.routes())
    .use(router.allowedMethods());

  return app;
}

export default createApp();
export { createApp };
