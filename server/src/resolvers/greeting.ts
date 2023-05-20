import { Context } from "../types/Context";
import { checkAuth } from "../middleware/checkAuth";
import { Ctx, Query, Resolver, UseMiddleware } from "type-graphql";
import { User } from "../entities/User";
import { Equal } from "typeorm";

@Resolver()
export class GreetingResolver {
  @Query((_return) => String)
  @UseMiddleware(checkAuth)
  async hello(@Ctx() { user }: Context): Promise<string> {
    const existingUser = await User.findOne({
      where: { id: Equal(user.userId) },
    });
    return `Hello ${existingUser ? existingUser.username : "World"}`;
  }
}
