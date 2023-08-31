import { Field, ID, ObjectType } from 'type-graphql';
import { prop as Property, getModelForClass } from '@typegoose/typegoose';

@ObjectType({ description: 'The Organization Model' })
export class Organization {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  @Property()
  backgroundImageURL?: string;

  @Field({ nullable: true })
  @Property()
  bio?: string;

  @Field()
  @Property()
  categorySlug: string;

  @Field()
  @Property()
  name: string;

  @Field({ nullable: true })
  @Property()
  profileImageURL?: string;

  @Field()
  @Property()
  slug: string;

  @Field()
  @Property({ default: 0 })
  shoutouts?: number;

  @Field()
  @Property()
  websiteURL: string;
}

export const OrganizationModel = getModelForClass(Organization);
