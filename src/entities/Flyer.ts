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
  @Property()
  imageURL: string;

  @Field()
  @Property({ nullable: true })
  description: string;

  @Field()
  @Property()
  location: string;

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
  @Property({ default: false })
  nsfw: boolean;

  @Field()
  @Property({ default: false })
  isTrending: boolean;

  @Field()
  @Property({ default: 0 })
  trendiness: number;

  @Field()
  @Property()
  isFiltered: boolean;
}

export const FlyerModel = getModelForClass(Flyer);
