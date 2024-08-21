const express = require('express')
import { Request, Response } from 'express';
const { getAllArticles } = require('./articles');
const { trainModel, updateModel } = require('./recommendationModel');
const { recommend } = require('./recommendationService');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const compression = require('compression');

const app = express();

import { CreateClientRedis, SetRedis, GetRedis, GetTTL } from './redis'
import { AnyObject } from './interfaces/AnyObject';
if (process.env.REDIS_HOST && process.env.REDIS_PORT) {
  CreateClientRedis().then((r: any) => {
    global.redis = r
  }).catch((er: any) => {
  })
}

app.disable('x-powered-by')
app.use(helmet({
  contentSecurityPolicy: false,
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin'
  }
}))

app.use(compression())
app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 1000000 }))
app.use(cookieParser())

app.get('/train', async (request: Request, response: Response) => {
  const articles = await getAllArticles();
  await trainModel(articles);
  response.send('Modelo treinado com sucesso.');
});

app.post('/update', async (request: Request, response: Response) => {
  const newArticle = request.body;
  await updateModel(newArticle);
  return response.send('Modelo atualizado com sucesso.');
});

app.post('/recommend', async (request: Request, response: Response) => {
  const articleLink = request.body.url;
  const cachedResult = await GetRedis(articleLink, true);
  if (cachedResult) {
    const cacheTTL = await GetTTL(articleLink);
    // Atualiza o cache caso tenha se passado 5 minutos ou mais
    if (cacheTTL <= 1500) {
      recommend(articleLink).then((recommendations: AnyObject[]) => {
        if (recommendations?.length) {
          SetRedis(articleLink, JSON.stringify(recommendations), 30);
        }
      })
    }

    return response.json(cachedResult);
  }

  const recommendations = await recommend(articleLink);

  if (recommendations?.length) {
    await SetRedis(articleLink, JSON.stringify(recommendations), 30);
  }

  return response.json(recommendations);
});

app.use((request: any, response: any, next: any) => {
  return response.status(404).send(`Not Found --> ${request.originalUrl}`);
})

app.use((err: any, request: any, response: any, next: any) => {
  return response.status(500).send(`Something went wrong. Please try again later.\n${err.message} - ${request.originalUrl}`);
})

app.listen(3005, () => {
  console.log('Server running on http://localhost:3005');
});
