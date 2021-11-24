import { Resolver, Mutation, Arg, Query } from 'type-graphql';
import { User } from '../entities/User';
import UserRepo from '../repos/UserRepo';
import WeeklyDebriefRepo from '../repos/WeeklyDebriefRepo';

@Resolver((_of) => User)
class UserResolver {
  @Query((_retuns) => User)
  async getUser(@Arg('uuid') uuid: string) {
    return UserRepo.getUserByUUID(uuid);
  }

  @Mutation((_returns) => User)
  async createUser(
    @Arg('deviceToken') deviceToken: string,
    @Arg('followedPublications', (type) => [String]) followedPublicationsIDs: string[],
    @Arg('deviceType') deviceType: string,
  ) {
    const user = await UserRepo.createUser(deviceToken, followedPublicationsIDs, deviceType);
    return user;
  }

  @Mutation((_returns) => User)
  async followPublication(@Arg('uuid') uuid: string, @Arg('pubID') pubID: string) {
    const user = await UserRepo.followPublication(uuid, pubID);
    return user;
  }

  @Mutation((_returns) => User)
  async unfollowPublication(@Arg('uuid') uuid: string, @Arg('pubID') pubID: string) {
    const user = await UserRepo.unfollowPublication(uuid, pubID);
    return user;
  }

  @Mutation((_returns) => User)
  async readArticle(@Arg('uuid') uuid: string, @Arg('articleID') articleID: string) {
    const user = await UserRepo.appendReadArticle(uuid, articleID);
    return user;
  }

  @Mutation((_returns) => User)
  async bookmarkArticle(@Arg('uuid') uuid: string) {
    const user = await UserRepo.incrementBookmarks(uuid);
    return user;
  }

  @Mutation((_returns) => [User])
  async getWeeklyDebrief() {
    const users = await WeeklyDebriefRepo.createWeeklyDebriefs();
    return users;
  }
}

export default UserResolver;
