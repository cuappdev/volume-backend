import { graphql, GraphQLSchema } from 'graphql';
import { makeExecutableSchema } from 'graphql-tools';
import { buildTypeDefsAndResolvers } from 'type-graphql';
import { dbConnection, disconnectDB } from '../src/db/DBConnection';
import ArticleResolver from '../src/resolvers/ArticleResolver';
import PublicationResolver from '../src/resolvers/PublicationResolver';
import { ArticleModel } from '../src/entities/Article';


const buildTestSchema = async (): Promise<GraphQLSchema> => {
  const { typeDefs, resolvers } = await buildTypeDefsAndResolvers({
    resolvers: [ArticleResolver, PublicationResolver],
  });
  return makeExecutableSchema({ typeDefs, resolvers });
}

beforeAll(async () => {
  await dbConnection();
});

afterAll(async () => {
  disconnectDB();
});

describe("testing queries and mutations in ArticleResolver", () => {
  it("retrieving an article by id", async () => {
    const schema = await buildTestSchema();

    const testArticle = await ArticleModel.create({
      title: "Orko Academy: A new way to learn",
      publication: "OrkoPublications",
      date: Date.now(),
      imageURL: "www.orko.com/pic",
      articleURL: "www.orko.com",
      likes: 0
    });

    const query = `
      query getArticleById($id: String!) {
        getArticleById(id: $id) {
          title
          publication
        }
      } 
    `;

    const response = await graphql(schema, query, undefined, undefined, { id: testArticle.id });

    expect(response).toEqual({
      data: {
        getArticleById: {
          title: testArticle.title,
          publication: testArticle.publication
        }
      }
    });
  });

  it("retrieving an article by id", async () => {


    const mutations = `
      mutation incrementLikseById($id: String!) {
        getArticleById(id: $id) {
          title
          publication
        }
      } 
    `;

    const response = await graphql(schema, query, undefined, undefined, { id: testArticle.id });

    expect(response).toEqual({
      data: {
        getArticleById: {
          title: testArticle.title,
          publication: testArticle.publication
        }
      }
    });
  });
});