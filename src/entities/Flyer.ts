import { Field, ID, ObjectType } from 'type-graphql';
import { prop as Property, getModelForClass } from '@typegoose/typegoose';
import { Organization } from './Organization';

@ObjectType({ description: 'The Flyer Model' })
export class Flyer {
  @Field(() => ID)
  id: string;

  @Field()
  @Property()
  date: Date;

  @Field()
  @Property({ nullable: true })
  description: string;

  @Field()
  @Property()
  imageURL: string;

  @Field()
  @Property({ default: false })
  isTrending: boolean;

  @Field()
  @Property()
  location: string;

  @Field()
  @Property({ default: false })
  nsfw: boolean;

  @Field((type) => Organization)
  @Property({ type: () => Organization })
  organization: Organization;

  @Field()
  @Property()
  organizationSlug: string;

  @Field()
  @Property({ default: 0 })
  shoutouts?: number;

  @Field()
  @Property()
  title: string;

  @Field()
  @Property({ default: 0 })
  trendiness: number;
}

export const FlyerModel = getModelForClass(Flyer);
