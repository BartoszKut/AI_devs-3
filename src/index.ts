import { Elysia } from 'elysia';

import { verify } from './s01e02-verify';
import { fix } from './s01e03-fix';
import { censorship } from './s01e05-report';
import { mp3 } from './s02e01-mp3';
import { city } from './s02e02-city';
import { robot } from './s02e03-robot';

const app = new Elysia()
    .get('/', () => 'Hello Elysia')
    .get('/verify', () => verify())
    .get('/fix', () => fix())
    .get('/censorship', () => censorship())
    .get('/mp3', () => mp3())
    .get('/city', () => city())
    .get('/robot', () => robot())
    .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
