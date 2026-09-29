import data from "./reglement.json";

export type ReglementArticle = {
  id: string;
  title: string;
  paragraphs: string[];
  list?: string[];
};

export type Reglement = {
  version: string;
  updated: string;
  articles: ReglementArticle[];
};

export const reglement = data as Reglement;
