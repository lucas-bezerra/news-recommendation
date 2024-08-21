import { AnyObject } from "./interfaces/AnyObject";

import { PromisePool } from '@supercharge/promise-pool';
const fs = require('fs');
const path = require('path');
const BM25 = require('./BM25');
const { preprocessText } = require('./textProcessing');

const MODEL_PATH = path.join(__dirname, 'model.json');

async function trainModel (articles: AnyObject[]) {
  const bm25 = new BM25();

  await PromisePool
    .for(articles)
    .withConcurrency(10)
    .process(async (article, index) => {
      const tokens = await preprocessText(article.conteudo_noticia + ' ' + (article.titulo || ''));
      return bm25.addDocument(article.titulo, article.url_noticia_curto, article.data, tokens);
    });

  fs.writeFileSync(MODEL_PATH, JSON.stringify(bm25));
}

async function updateModel (newArticle: AnyObject) {
  if (fs.existsSync(MODEL_PATH)) {
    const bm25 = new BM25();
    const existingModel = JSON.parse(fs.readFileSync(MODEL_PATH, 'utf-8'));
    Object.assign(bm25, existingModel);

    const tokens = await preprocessText(newArticle.conteudo_noticia + ' ' + (newArticle.titulo || ''));
    bm25.addDocument(newArticle.titulo, newArticle.url_noticia_curto, newArticle.data, tokens);

    fs.writeFileSync(MODEL_PATH, JSON.stringify(bm25));
  } else {
    await trainModel([newArticle]);
  }
}

async function loadModel () {
  if (fs.existsSync(MODEL_PATH)) {
    const bm25 = new BM25();
    const existingModel = JSON.parse(fs.readFileSync(MODEL_PATH, 'utf-8'));
    Object.assign(bm25, existingModel);
    return bm25;
  }
  return null;
}

module.exports = {
  trainModel,
  updateModel,
  loadModel
};
