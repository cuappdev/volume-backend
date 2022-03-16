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
    description: `Creates a single <User> via given <deviceToken>, <followedPublications>,
   and <deviceType>. Given <deviceToken> must be unique for a new user to be created, otherwise does nothing.`,
  })
  async createUser(
    @Arg('deviceToken') deviceToken: string,
    @Arg('followedPublications', (type) => [String]) followedPublicationsIDs: string[],
    @Arg('deviceType') deviceType: string,
  ) {
    return await UserRepo.createUser(deviceToken, followedPublicationsIDs, deviceType);
  }

  @Mutation((_returns) => User, {
    nullable: true,
    description: 'Lets the user from a given <uuid> follow the <Publication> given by <pubID>',
  })
  async followPublication(@Arg('uuid') uuid: string, @Arg('pubID') pubID: string) {
    return await UserRepo.followPublication(uuid, pubID);
  }

  @Mutation((_returns) => User, {
    nullable: true,
    description: 'Lets the user from a given <uuid> unfollow the <Publication> given by <pubID>',
  })
  async unfollowPublication(@Arg('uuid') uuid: string, @Arg('pubID') pubID: string) {
    return await UserRepo.unfollowPublication(uuid, pubID);
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
