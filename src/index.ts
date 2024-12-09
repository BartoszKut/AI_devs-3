import { Elysia } from 'elysia';
import { verify } from './s01e02-verify';

const app = new Elysia()
    .get('/', () => 'Hello Elysia')
    .get('/verify', () => verify())
    .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
