import { Field, ID, ObjectType } from 'type-graphql';
import { prop as Property, DocumentType, getModelForClass } from '@typegoose/typegoose';
import mongoose from 'mongoose';
import { Article } from './Article';
import WeeklyDebrief from './WeeklyDebrief';
import { PublicationID } from '../common/types';

@ObjectType({ description: 'The User Model' })
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  @Property()
  uuid: string; // id of user stored on frontend

  // https://github.com/typegoose/typegoose/issues/522
  // https://github.com/typegoose/typegoose/discussions/380
  @Field((type) => [PublicationID])
  @Property({ required: true, type: () => PublicationID, default: [] })
  followedPublications: mongoose.Types.DocumentArray<DocumentType<PublicationID>>;

  @Field()
  @Property({ unique: true })
  deviceToken: string;

  @Field()
  @Property()
  deviceType: string; // ANDROID, IOS

  @Field()
  @Property({ default: 0 })
  shoutouts?: number;

  @Field((type) => [Article])
  @Property({ required: true, type: () => Article, default: [] })
  articlesRead: mongoose.Types.DocumentArray<DocumentType<Article>>;

  @Field()
  @Property()
  weeklyDebrief: WeeklyDebrief;
}

export const UserModel = getModelForClass(User);
