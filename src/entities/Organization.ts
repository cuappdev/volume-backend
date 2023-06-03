import { Field, ID, ObjectType } from 'type-graphql';
import { prop as Property, getModelForClass } from '@typegoose/typegoose';

@ObjectType({ description: 'The Organization Model' })
export class Organization {
  @Field(() => ID)
  id: string;

  @Field()
  @Property({ nullable: true })
  backgroundImageURL: string;

  @Field()
  @Property({ nullable: true })
  bio: string;

  @Field()
  @Property()
  categorySlug: string;

  @Field()
  @Property()
  name: string;

  @Field()
  @Property({ nullable: true })
  profileImageURL: string;

  @Field()
  @Property()
  slug: string;

  @Field()
  @Property({ default: 0 })
  shoutouts?: number;

  @Field()
  @Property({ nullable: true })
  websiteURL: string;
}

export const OrganizationModel = getModelForClass(Organization);
