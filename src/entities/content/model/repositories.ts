import repositoriesPayload from './generated/repositories.json';
import { formatDateRu } from './format';

interface GeneratedRepository {
  id: number;
  name: string;
  description: string;
  htmlUrl: string;
  homepage: string;
  language: string;
  topics: string[];
  stars: number;
  pushedAt: string;
}

interface GeneratedRepositoriesPayload {
  generatedAt: string;
  repositories: GeneratedRepository[];
}

export interface RepositoryCard {
  id: string;
  name: string;
  summary: string;
  tags: string[];
  updatedLabel: string;
  year: string;
  repositoryUrl: string;
  homepageUrl: string;
}

const DEFAULT_SUMMARY = 'Описание репозитория пока не добавлено.';
const typedPayload = repositoriesPayload as GeneratedRepositoriesPayload;

export const repositoriesGeneratedAt = typedPayload.generatedAt;

export const repositories: RepositoryCard[] = typedPayload.repositories.map((repository) => {
  const tags = [
    repository.language,
    ...repository.topics.slice(0, 3),
    `★ ${repository.stars}`,
  ].filter(Boolean);

  return {
    id: String(repository.id),
    name: repository.name,
    summary: repository.description.trim() || DEFAULT_SUMMARY,
    tags: tags.length > 0 ? tags.slice(0, 5) : ['GitHub'],
    updatedLabel: formatDateRu(repository.pushedAt),
    year: repository.pushedAt ? String(new Date(repository.pushedAt).getFullYear()) : 'Н/Д',
    repositoryUrl: repository.htmlUrl,
    homepageUrl: repository.homepage,
  };
});
