import { Elysia } from 'elysia';
import { verify } from './s01e02-verify';
import { fix } from './s01e03-fix';

const app = new Elysia()
    .get('/', () => 'Hello Elysia')
    .get('/verify', () => verify())
    .get('/fix', () => fix())
    .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
