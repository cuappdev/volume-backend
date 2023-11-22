import { Field, ID, ObjectType } from 'type-graphql';
import { prop as Property, DocumentType, getModelForClass } from '@typegoose/typegoose';
import mongoose from 'mongoose';
import { Article } from './Article';
import WeeklyDebrief from './WeeklyDebrief';
import { PublicationSlug } from '../common/types';
import { Flyer } from './Flyer';
import { Organization } from './Organization';
import { Magazine } from './Magazine';

@ObjectType({ description: 'The User Model' })
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  @Property()
  uuid: string; // id of user stored on frontend

  // https://github.com/typegoose/typegoose/issues/522
  // https://github.com/typegoose/typegoose/discussions/380
  @Field((type) => [PublicationSlug])
  @Property({ required: true, type: () => PublicationSlug, default: [] })
  followedPublications: mongoose.Types.DocumentArray<DocumentType<PublicationSlug>>;

  @Field()
  @Property({ unique: true })
  deviceToken: string;

  @Field()
  @Property()
  deviceType: string; // ANDROID, IOS

  @Field()
  @Property({ default: 0 })
  numShoutouts?: number;

  @Field((type) => [Article])
  @Property({ required: true, type: () => Article, default: [] })
  readArticles: mongoose.Types.DocumentArray<DocumentType<Article>>;

  @Field((type) => [Magazine])
  @Property({ required: true, type: () => Magazine, default: [] })
  readMagazines: mongoose.Types.DocumentArray<DocumentType<Magazine>>;

  @Field((type) => [Flyer])
  @Property({ required: true, type: () => Flyer, default: [] })
  readFlyers: mongoose.Types.DocumentArray<DocumentType<Flyer>>;

  @Field((type) => [Flyer])
  @Property({ required: true, type: () => Flyer, default: [] })
  favoritedFlyers: mongoose.Types.DocumentArray<DocumentType<Flyer>>;

  @Field((type) => [Organization])
  @Property({ required: true, type: () => Organization, default: [] })
  followedOrganizations: mongoose.Types.DocumentArray<DocumentType<Organization>>;

  @Field((type) => [Article])
  @Property({ required: true, type: () => Article, default: [] })
  bookmarkedArticles: mongoose.Types.DocumentArray<DocumentType<Article>>;

  @Field((type) => [Magazine])
  @Property({ required: true, type: () => Magazine, default: [] })
  bookmarkedMagazines: mongoose.Types.DocumentArray<DocumentType<Magazine>>;

  @Field((type) => [Flyer])
  @Property({ required: true, type: () => Flyer, default: [] })
  bookmarkedFlyers: mongoose.Types.DocumentArray<DocumentType<Flyer>>;

  @Field({ nullable: true })
  @Property()
  weeklyDebrief?: WeeklyDebrief;
}

export const UserModel = getModelForClass(User);
