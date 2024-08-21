const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const DATASET_PATH = path.join(__dirname, 'data/Historico_de_materias.csv');
const results: any[] = [];

async function getAllArticles () {
  return new Promise(async (resolve, reject) => {
    fs.createReadStream(DATASET_PATH)
      .pipe(csv())
      .on('data', (data: any) => results.push(data))
      .on('end', () => {
        resolve(results)
      })
  })
}

async function getArticleByLink (link: string) {
  return new Promise(async (resolve, reject) => {
    fs.createReadStream(DATASET_PATH)
      .pipe(csv())
      .on('data', (data: any) => results.push(data))
      .on('end', () => {
        const result = results.filter((article) => {
          return article.url_noticia_curto === link
        })

        resolve(result[0])
      })
  })
}

module.exports = {
  getAllArticles,
  getArticleByLink
};
