import { Context } from 'koa';

export default (ctx: Context) => {
  ctx.body = 'hello world';
};