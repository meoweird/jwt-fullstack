import { AuthenticationError } from "apollo-server-express";
import { Context } from "../types/Context";
import { MiddlewareFn } from "type-graphql";
import { verify } from "jsonwebtoken";
import { Secret } from "jsonwebtoken";
import { UserAuthPayload } from "../types/UserAuthPayload";

export const checkAuth: MiddlewareFn<Context> = ({ context }, next) => {
  try {
    const authHeader = context.req.header("Authorization");
    const accessToken = authHeader && authHeader.split(" ")[1];

    if (!accessToken)
      throw new AuthenticationError(
        "Not authenicated to perform GraphQL operations"
      );

    const decodedUser = verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET as Secret
    ) as UserAuthPayload;

    context.user = decodedUser;
    return next();
  } catch (error) {
    throw new AuthenticationError(`${JSON.stringify(error)}`);
  }
};
