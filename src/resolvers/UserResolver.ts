import { Resolver, Mutation, Arg } from 'type-graphql';
import { User } from '../entities/User';
import UserRepo from '../repos/UserRepo';

@Resolver((_of) => User)
class UserResolver {
  @Mutation((_returns) => User)
  async createUser(
    @Arg('deviceToken') deviceToken: string,
    @Arg('followedPublications', (type) => [String]) followedPublicationsIDs: string[],
    @Arg('notification') notification: string,
  ) {
    const user = await UserRepo.createUser(deviceToken, followedPublicationsIDs, notification);
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
}

export default UserResolver;
