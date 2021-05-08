import { Resolver, Mutation, Arg } from 'type-graphql';
import { User } from '../entities/User';
import UserRepo from '../repos/UserRepo';

@Resolver((_of) => User)
class UserResolver {
  // need to add encryption
  @Mutation((_returns) => User)
  async createUser(
    @Arg('id') id: string,
    @Arg('deviceToken') deviceToken: string,
    @Arg('followedPublications', (type) => [String]) followedPublications: string[],
    @Arg('notification') notification: string,
  ) {
    return UserRepo.createUser(id, deviceToken, followedPublications, notification);
  }
}

export default UserResolver;
