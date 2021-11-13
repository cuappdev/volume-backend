import { Resolver, Mutation, Arg, Query, FieldResolver, Root } from 'type-graphql';
import { WeeklyDebrief } from '../entities/WeeklyDebrief';
import WeeklyDebriefRepo from '../repos/WeeklyDebriefRepo';
import { DEFAULT_LIMIT } from '../common/constants';

@Resolver((_of) => WeeklyDebrief)
class WeeklyDebriefResolver {
  @Query((_returns) => WeeklyDebrief, { nullable: true })
  async getWeeklyDebrief(@Arg('uuid') uuid: string): Promise<WeeklyDebrief> {
    return WeeklyDebriefRepo.getWeeklyDebrief(uuid);
  }

  @FieldResolver((_returns) => Date)
  async expirationDate(@Root() wd: WeeklyDebrief): Promise<Date> {
    return WeeklyDebriefRepo.getExpirationDate(wd.createdAt);
  }
}
export default WeeklyDebriefResolver;
