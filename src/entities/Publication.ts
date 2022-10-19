import { Field, ID, ObjectType } from 'type-graphql';
import { prop as Property, getModelForClass } from '@typegoose/typegoose';

@ObjectType({ description: 'The Publication Model' })
export class Publication {
  @Field(() => ID)
  id: string;

  @Field()
  @Property()
  backgroundImageURL: string;

  @Field()
  @Property()
  bio: string;

  @Field()
  @Property()
  bioShort: string;

  @Field()
  @Property()
  name: string;

  @Field()
  @Property()
  profileImageURL: string;

  @Field()
  @Property()
  rssName: string;

  @Field({ nullable: true })
  @Property()
  rssURL?: string;

  @Field()
  @Property()
  slug: string;

  @Field()
  @Property({ default: 0 })
  shoutouts?: number;

  @Field()
  @Property()
  websiteURL: string;

  @Field(() => [String])
  @Property()
  contentTypes: string[];
}

export const PublicationModel = getModelForClass(Publication);
