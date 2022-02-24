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
   and <deviceType>. Will not create a user if one with the same <deviceToken> already exists.`,
  })
  async createUser(
    @Arg('deviceToken') deviceToken: string,
    @Arg('followedPublications', (type) => [String]) followedPublicationsIDs: string[],
    @Arg('deviceType') deviceType: string,
  ) {
    const user = await UserRepo.createUser(deviceToken, followedPublicationsIDs, deviceType);
    return user;
  }

  @Mutation((_returns) => User, {
    nullable: true,
    description: 'Lets the user from a given <uuid> follow the <Publication> given by <pubID>',
  })
  async followPublication(@Arg('uuid') uuid: string, @Arg('pubID') pubID: string) {
    const user = await UserRepo.followPublication(uuid, pubID);
    return user;
  }

  @Mutation((_returns) => User, {
    nullable: true,
    description: 'Lets the user from a given <uuid> unfollow the <Publication> given by <pubID>',
  })
  async unfollowPublication(@Arg('uuid') uuid: string, @Arg('pubID') pubID: string) {
    const user = await UserRepo.unfollowPublication(uuid, pubID);
    return user;
  }

  @Mutation((_returns) => User, {
    nullable: true,
    description: "Adds the <Article> given by the <articleID> to the <User's> read articles",
  })
  async readArticle(@Arg('uuid') uuid: string, @Arg('articleID') articleID: string) {
    const user = await UserRepo.appendReadArticle(uuid, articleID);
    return user;
  }

  @Mutation((_returns) => User, {
    nullable: true,
    description: 'Increments the number of bookmarks for the <User> given by <uuid>',
  })
  async bookmarkArticle(@Arg('uuid') uuid: string) {
    const user = await UserRepo.incrementBookmarks(uuid);
    return user;
  }

  @Mutation((_returns) => [User], {
    description: 'Creates and returns the Weekly Debrief for all users',
  })
  async getWeeklyDebrief() {
    const users = await WeeklyDebriefRepo.createWeeklyDebriefs();
    return users;
  }
}

export default UserResolver;
