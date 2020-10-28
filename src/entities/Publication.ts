import { ObjectType, Field } from 'type-graphql';

@ObjectType({ description: 'The Publications Model' })
export class Publication {
  @Field()
  slug: String;

  @Field()
  bio: String;

  @Field()
  feed: String;

  @Field({ nullable: true })
  img: String;

  @Field()
  name: String;

  @Field()
  url: String;
}
