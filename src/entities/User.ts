import { Field, ID, ObjectType } from 'type-graphql';
import { prop as Property, getModelForClass } from '@typegoose/typegoose';

@ObjectType({ description: 'The User Model' })
export class User {
  @Field(() => ID)
  uuid: string;

  @Field()
  @Property()
  deviceToken: string;

  @Field()
  @Property()
  followedPublications: [string];

  @Field()
  @Property()
  notification: string; // ANDROID, IOS
}

export const UserModel = getModelForClass(User);
