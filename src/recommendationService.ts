const { getArticleByLink } = require('./articles');
const { loadModel } = require('./recommendationModel');
const { preprocessText } = require('./textProcessing');

async function recommend (articleLink: string, topN = 10) {
  const model = await loadModel();
  if (!model) return [];

  const article = await getArticleByLink(articleLink);
  const tokens = await preprocessText(article.conteudo_noticia + ' ' + (article.titulo || ''));

  const recommendations = model.search(tokens, topN);

  return recommendations
}

module.exports = {
  recommend
};
