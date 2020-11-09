import { Field, ID, ObjectType } from 'type-graphql';
import { prop as Property, getModelForClass } from '@typegoose/typegoose';

@ObjectType({ description: 'The Publication Model' })
export class Publication {
  @Field(() => ID)
  id: string;

  @Field()
  @Property({ unique: true })
  slug: string;

  @Field()
  @Property()
  bio: string;

  @Field()
  rssURL: string;

  @Field()
  @Property()
  imageURL: string;

  @Field()
  @Property()
  name: string;

  @Field()
  @Property({ unique: true })
  websiteURL: string;

  @Field()
  @Property({ unique: true })
  rssName: string;

  @Field()
  @Property()
  shoutouts: number;
}

export const PublicationModel = getModelForClass(Publication);
