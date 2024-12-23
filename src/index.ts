import { Elysia } from 'elysia';

import { verify } from './s01e02-verify';
import { fix } from './s01e03-fix';
import { censorship } from './s01e05-report';

const app = new Elysia()
    .get('/', () => 'Hello Elysia')
    .get('/verify', () => verify())
    .get('/fix', () => fix())
    .get('/censorship', () => censorship())
    .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
