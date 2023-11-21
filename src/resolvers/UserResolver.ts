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
    description: 'User with id <uuid> follows the <Organization> referenced by <slug>',
  })
  async followOrganization(@Arg('uuid') uuid: string, @Arg('slug') slug: string) {
    return await UserRepo.followOrganization(uuid, slug);
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
    description: 'User with id <uuid> unfollows the <Organization> referenced by <slug>',
  })
  async unfollowOrganization(@Arg('uuid') uuid: string, @Arg('slug') slug: string) {
    return await UserRepo.unfollowOrganization(uuid, slug);
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
    description: "Adds the <Magazine> given by the <magazineID> to the <User's> read magazines",
  })
  async readMagazine(@Arg('uuid') uuid: string, @Arg('magazineID') magazineID: string) {
    return await UserRepo.appendReadMagazine(uuid, magazineID);
  }

  @Mutation((_returns) => User, {
    nullable: true,
    description: "Adds the <Flyer> given by the <flyerID> to the <User's> read flyers",
  })
  async readFlyer(@Arg('uuid') uuid: string, @Arg('flyerID') flyerID: string) {
    return await UserRepo.appendReadFlyer(uuid, flyerID);
  }

  @Mutation((_returns) => User, {
    nullable: true,
    description: 'Adds the <Article> given by <articleID> to the <User> <bookmarkedArticles> field',
  })
  async bookmarkArticle(@Arg('uuid') uuid: string, @Arg('articleID') articleID: string) {
    return await UserRepo.bookmarkArticle(uuid, articleID);
  }

  @Mutation((_returns) => User, {
    nullable: true,
    description:
      'Adds the <Magazine> given by <magazineID> to the <User> <bookmarkedMagazines> field',
  })
  async bookmarkMagazine(@Arg('uuid') uuid: string, @Arg('magazineID') magazineID: string) {
    return await UserRepo.bookmarkMagazine(uuid, magazineID);
  }

  @Mutation((_returns) => User, {
    nullable: true,
    description: 'Adds the <Flyer> given by <flyerID> to the <User> <bookmarkedFlyers> field',
  })
  async bookmarkFlyer(@Arg('uuid') uuid: string, @Arg('flyerID') flyerID: string) {
    return await UserRepo.bookmarkFlyer(uuid, flyerID);
  }

  @Mutation((_returns) => User, {
    nullable: true,
    description: 'Removes the <Article> given by <articleID> from the <User> <bookmarkedArticles>',
  })
  async unbookmarkArticle(@Arg('uuid') uuid: string, @Arg('articleID') articleID: string) {
    return await UserRepo.unbookmarkArticle(uuid, articleID);
  }

  @Mutation((_returns) => User, {
    nullable: true,
    description:
      'Removes the <Magazine> given by <magazineID> from the <User> <bookmarkedMagazines>',
  })
  async unbookmarkMagazine(@Arg('uuid') uuid: string, @Arg('magazineID') magazineID: string) {
    return await UserRepo.unbookmarkMagazine(uuid, magazineID);
  }

  @Mutation((_returns) => User, {
    nullable: true,
    description: 'Removes the <Flyer> given by <flyerID> from the <User> <bookmarkedFlyers>',
  })
  async unbookmarkFlyer(@Arg('uuid') uuid: string, @Arg('flyerID') flyerID: string) {
    return await UserRepo.unbookmarkFlyer(uuid, flyerID);
  }

  @Mutation((_returns) => [User], {
    description: 'Creates Weekly Debriefs for all users',
  })
  async getWeeklyDebrief() {
    return await WeeklyDebriefRepo.createWeeklyDebriefs();
  }
}

export default UserResolver;
