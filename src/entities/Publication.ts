import { Field, ObjectType } from 'type-graphql';

@ObjectType({ description: 'The Publications Model' })
export default class Publication {
  @Field()
  articlesURL: string;

  @Field()
  bio: string;

  @Field({ nullable: true })
  imageURL: string;

  @Field()
  name: string;

  @Field()
  slug: string;

  @Field()
  websiteURL: string;
}
