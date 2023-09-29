import { Field, ID, ObjectType } from 'type-graphql';
import { prop as Property, getModelForClass, index } from '@typegoose/typegoose';
import { Organization } from './Organization';

// Index flyers based on fields to be considered in search
@index({ title: 'text', 'organization.name': 'text' })
@ObjectType({ description: 'The Flyer Model' })
export class Flyer {
  @Field(() => ID)
  id: string;

  @Field()
  @Property()
  categorySlug: string;

  @Field()
  @Property()
  endDate: Date;

  @Field({ nullable: true })
  @Property()
  flyerURL?: string;

  @Field()
  @Property()
  imageURL: string;

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
  @Property()
  startDate: Date;

  @Field()
  @Property({ default: 0 })
  timesClicked?: number;

  @Field()
  @Property()
  title: string;

  @Field()
  @Property({ default: 0 })
  trendiness: number;
}

export const FlyerModel = getModelForClass(Flyer);
