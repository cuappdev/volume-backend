/* eslint-disable no-return-await */
import { Resolver, Mutation, Arg, Query } from 'type-graphql';
import { User } from '../entities/User';
import UserRepo from '../repos/UserRepo';
import WeeklyDebriefRepo from '../repos/WeeklyDebriefRepo';

@Resolver((_of) => User)
class UserResolver {
  @Query((_returns) => User, {
    nullable: true,
    description: 'Returns a single [User] via a given [uuid]',
  })
  async getUser(@Arg('uuid') uuid: string) {
    return UserRepo.getUserByUUID(uuid);
  }

  @Mutation((_returns) => User, {
    description: `Creates a single <User> via given <deviceToken>, <followedPublications> (slugs),
   and <deviceType>. Given <deviceToken> must be unique for a new user to be created, otherwise does nothing.`,
  })
  async createUser(
    @Arg('deviceToken') deviceToken: string,
    @Arg('followedPublications', (type) => [String]) followedPublicationsSlugs: string[],
    @Arg('deviceType') deviceType: string,
  ) {
    return await UserRepo.createUser(deviceToken, followedPublicationsSlugs, deviceType);
  }

  @Mutation((_returns) => User, {
    nullable: true,
    description: 'User with id <uuid> follows the <Publication> referenced by <slug>',
  })
  async followPublication(@Arg('uuid') uuid: string, @Arg('slug') slug: string) {
    return await UserRepo.followPublication(uuid, slug);
  }

  @Mutation((_returns) => User, {
    nullable: true,
    description: 'User with id <uuid> unfollows the <Publication> referenced by <slug>',
  })
  async unfollowPublication(@Arg('uuid') uuid: string, @Arg('slug') slug: string) {
    return await UserRepo.unfollowPublication(uuid, slug);
  }

  @Mutation((_returns) => User, {
    nullable: true,
    description: "Adds the <Article> given by the <articleID> to the <User's> read articles",
  })
  async readArticle(@Arg('uuid') uuid: string, @Arg('articleID') articleID: string) {
    return await UserRepo.appendReadArticle(uuid, articleID);
  }

  @Mutation((_returns) => User, {
    nullable: true,
    description: "Adds the <Magazine> given by the <magazineID> to the <User's> read articles",
  })
  async readMagazine(@Arg('uuid') uuid: string, @Arg('magazineID') magazineID: string) {
    return await UserRepo.appendReadMagazine(uuid, magazineID);
  }

  @Mutation((_returns) => User, {
    nullable: true,
    description: 'Increments the number of bookmarks for the <User> given by <uuid>',
  })
  async bookmarkArticle(@Arg('uuid') uuid: string) {
    return await UserRepo.incrementBookmarks(uuid);
  }

  @Mutation((_returns) => [User], {
    description: 'Creates Weekly Debriefs for all users',
  })
  async getWeeklyDebrief() {
    return await WeeklyDebriefRepo.createWeeklyDebriefs();
  }
}

export default UserResolver;
