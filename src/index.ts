import { Elysia } from 'elysia';

import { verify } from './s01e02-verify';
import { fix } from './s01e03-fix';
import { censorship } from './s01e05-report';
import { mp3 } from './s02e01-mp3';
import { city } from './s02e02-city';
import { robot } from './s02e03-robot';
import { categories } from './s02e04-categories';
import { arxiv } from './s02e05-arxiv';
import { documents } from './s03e01-documents';
import { vectors } from './s03e02-vectors';
import { database } from './s03e03-database';
import { loop } from './s03e04-loop';
import { connections } from './s03e05-connections';
import { photos } from './s04e01-photos';
import { research } from './s04e02-research';

const app = new Elysia()
    .get('/', () => 'Hello Elysia')
    .get('/verify', () => verify())
    .get('/fix', () => fix())
    .get('/censorship', () => censorship())
    .get('/mp3', () => mp3())
    .get('/city', () => city())
    .get('/robot', () => robot())
    .get('/categories', () => categories())
    .get('/arxiv', () => arxiv())
    .get('/arxiv', () => arxiv())
    .get('/documents', () => documents())
    .get('/vectors', () => vectors())
    .get('/database', () => database())
    .get('/loop', () => loop())
    .get('/connections', () => connections())
    .get('/photos', () => photos())
    .get('/research', () => research())
    .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
