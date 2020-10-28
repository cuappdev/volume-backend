import { Field, ObjectType } from 'type-graphql';

@ObjectType({ description: 'The Publications Model' })
export default class Publication {
  @Field()
  slug: string;

  @Field()
  bio: string;

  @Field()
  feed: string;

  @Field({ nullable: true })
  img: string;

  @Field()
  name: string;

  @Field()
  url: string;
}
