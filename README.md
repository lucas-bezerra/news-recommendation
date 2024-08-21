# Sistema de Recomendação de Artigos

- [Visão Geral](#visão-geral)
- [Documentação](#documentação)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Dependências](#dependências)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Funcionalidades](#funcionalidades)
  - [1. Processamento de Dados](#1-processamento-de-dados)
  - [2. Modelo de Recomendação](#2-modelo-de-recomendação)
  - [3. Serviço de Recomendação](#3-serviço-de-recomendação)
- [Como Usar](#como-usar)
  - [Treinar o Modelo](#treinar-o-modelo)
  - [Atualizar o Modelo](#atualizar-o-modelo)
  - [Obter Recomendações](#obter-recomendações)
- [Detalhes Técnicos](#detalhes-técnicos)
  - [Modelo BM25](#modelo-bm25)
  - [Dataset](#dataset)

## Visão Geral

Este projeto implementa um sistema de recomendação de artigos baseado no algoritmo BM25, utilizando `NodeJS` e `ExpressJS`. O sistema inclui funcionalidades para treinar e atualizar um modelo de recomendação, e fornecer recomendações de artigos com base no modelo treinado.

## Documentação

Para mais detalhes técnicos e explicações aprofundadas, consulte a [Wiki](https://github.com/lucas-bezerra/node-bm25/wiki).

## Estrutura do Projeto

```plaintext
advanced-article-recommendation/
│
├── articles.ts                     # Funções para manipulação e extração de dados da tabela articles
├── bm25.ts                         # Implementação do algoritmo BM25
├── recommendationModel.ts          # Treinamento, atualização e carregamento do modelo de recomendação
├── recommendationService.ts        # Serviço para gerar recomendações baseadas no modelo treinado
├── server.ts                       # Servidor ExpressJS que fornece a API para treinamento e recomendações
├── textProcessing.ts               # Funções de pré-processamento de texto (lematização, n-grams, etc.)
└── data
    └── Historico_de_materias.csv   # Dataset de artigos em português
```

## Dependências

O projeto utiliza as seguintes bibliotecas e pacotes NPM:

* `express`: Framework web para a API.
* `redis`: Banco de dados em memória para armazenar o modelo de recomendação.
* `natural`: Processamento de linguagem natural (tokenização).
* `sanitize-html`: Sanitização de texto.
* `stopword`: Stopwords em português.
* `@supercharge/promise-pool`: Gerenciamento de concorrência.

## Configuração do Ambiente

1. Clone o repositório e navegue até o diretório do projeto.

2. Instale as dependências:

```bash
npm install
yarn install
```

## Funcionalidades

### 1. Processamento de Dados

O sistema realiza o pré-processamento dos textos dos artigos para melhorar a qualidade das recomendações. Isso inclui:

* **Tokenização**: Dividir o texto em palavras ou tokens.
* **Remoção de Stopwords**: Eliminar palavras comuns que não carregam muito significado.
* **Geração de N-Grams**: Criar combinações de palavras adjacentes para capturar contexto.

### 2. Modelo de Recomendação

O sistema implementa o algoritmo BM25 para calcular a relevância de um documento em relação a uma consulta. O modelo é treinado com os artigos do banco de dados e atualizado incrementalmente com novos artigos.

* **Treinamento**: Calcula os pesos dos termos e documentos para cada artigo.
* **Atualização**: Adiciona um novo artigo ao modelo e recalcula os pesos dos termos e documentos.

### 3. Serviço de Recomendação

O sistema expõe uma API REST para interagir com o modelo de recomendação:

* **Treinamento do Modelo**: Treina o modelo com todos os artigos (GET `/train`).
* **Atualização do Modelo**: Atualiza o modelo com um novo artigo (POST `/update`).
* **Obter Recomendações**: Retorna uma lista de artigos recomendados para um dado artigo (POST `/recommend`).

# Como Usar

## Treinar o Modelo

Para treinar o modelo com todos os artigos do banco de dados, envie uma requisição GET para o endpoint `/train`:

```bash
curl http://localhost:3000/train
```

## Atualizar o Modelo

Para adicionar um novo artigo ao modelo de forma incremental, envie uma requisição POST para o endpoint `/update` com os dados do artigo:

```bash
curl -X POST http://localhost:3000/update -H "Content-Type: application/json" -d '{
  "data": "2014-01-25",
  "url_noticia_curto": "http://g1.globo.com/economia/noticia/2014/01/mesmo-com-alta-do-dolar-gasto-de-brasileiros-no-exterior-bate-recorde.html",
  "titulo": "Mesmo com alta do dólar, gastos de brasileiros no exterior batem recorde",
  "conteudo_noticia": "A alta de 15% no dólar em 2013, a maior dos últimos cinco anos..."
}'
```

## Obter Recomendações

Para obter recomendações de artigos similares, envie uma requisição POST para o endpoint `/recommend`, onde `body.url` é o `url_noticia_curto` do artigo de referência:

```bash
curl -X POST http://localhost:3000/recommend -H "Content-Type: application/json" -d '{
  "url": "http://g1.globo.com/economia/noticia/2014/02/mercosul-emperra-relacao-do-brasil-com-uniao-europeia.html"
}'
```

# Detalhes Técnicos

## Modelo BM25

O algoritmo BM25 é uma variação do TF-IDF que leva em consideração a frequência de termos em um documento e a frequência de termos em um corpus. O BM25 é uma função de ranqueamento que calcula a relevância de um documento em relação a uma consulta.

## Dataset

Para treinar o modelo de recomendação, o sistema utiliza o dataset [Notícias publicadas no Brasil](https://www.kaggle.com/datasets/diogocaliman/notcias-publicadas-no-brasil) criado por [Diogo Caliman](https://www.kaggle.com/diogocaliman).

Cada artigo do dataset é representado por um objeto com os seguintes campos:

* `data`: Data da publicação do artigo.
* `url_noticia_curto`: URL curta do artigo.
* `titulo`: Título do artigo.
* `conteudo_noticia`: Conteúdo do artigo.

Exemplo:

````json
{
  "data": "2014-01-25",
  "url_noticia_curto": "http://g1.globo.com/economia/noticia/2014/01/mesmo-com-alta-do-dolar-gasto-de-brasileiros-no-exterior-bate-recorde.html",
  "titulo": "Mesmo com alta do dólar, gastos de brasileiros no exterior batem recorde",
  "conteudo_noticia": "A alta de 15% no dólar em 2013, a maior dos últimos cinco anos..."
}
````