import { AnyObject } from "./interfaces/AnyObject";

class BM25 {
  private documents: AnyObject[];
  private docFreqs: AnyObject;
  private avgDocLength: number;
  private dateWeight: number;
  private k1: number;
  private b: number;

  constructor() {
    this.documents = [];
    this.docFreqs = {};
    this.avgDocLength = 0;
    this.dateWeight = 0.025;
    this.k1 = 1.5;
    this.b = 0.75;
  }

  addDocument (docTitle: string, docUrl: string, docPubliDate: string, tokens: string[]) {
    const docLength = tokens.length;
    this.documents.push({ docTitle, docUrl, docPubliDate, tokens, docLength });

    tokens.forEach(token => {
      if (!this.docFreqs[token]) {
        this.docFreqs[token] = 0;
      }
      this.docFreqs[token]++;
    });

    this.avgDocLength = this.documents.reduce((sum, doc) => sum + doc.docLength, 0) / this.documents.length;
  }

  calculateScore (queryTokens: any[], document: AnyObject) {
    const { tokens: docTokens, docLength, docPubliDate } = document;
    let score = 0;
    const docTokenFreq = docTokens.reduce((freq: any, token: string) => {
      freq[token] = (freq[token] || 0) + 1;
      return freq;
    }, {});

    const currentDate = new Date();
    const publiDate = new Date(docPubliDate);
    const ageInDays = Math.floor((currentDate.getTime() - publiDate.getTime()) / (1000 * 60 * 60 * 24));
    const dateFactor = 1 / (1 + this.dateWeight * ageInDays);

    queryTokens.forEach(queryToken => {
      if (!this.docFreqs[queryToken]) return;

      const termFreq = docTokenFreq[queryToken] || 0;
      const docFreq = this.docFreqs[queryToken];
      const idf = Math.log((this.documents.length - docFreq + 0.5) / (docFreq + 0.5) + 1);

      score += idf * ((termFreq * (this.k1 + 1)) / (termFreq + this.k1 * (1 - this.b + this.b * (docLength / this.avgDocLength)))) * dateFactor;
    });

    return score;
  }

  search (queryTokens: any[], topN = 5) {
    const scores = this.documents.map(doc => ({
      title: doc.docTitle,
      url: doc.docUrl,
      pubDate: doc.docPubliDate,
      score: this.calculateScore(queryTokens, doc)
    }));

    scores.sort((a, b) => b.score - a.score);
    scores.forEach((el) => {
      delete el.score;
    });

    return scores.slice(1, (topN + 1));
  }
}

module.exports = BM25;
