import { User } from "../entities/User";
import { RegisterInput } from "../types/RegisterInput";
import { Arg, Ctx, ID, Mutation, Query, Resolver } from "type-graphql";
import argon2 from "argon2";
import { Equal } from "typeorm";
import { UserMutationResponse } from "../types/UserMutationResponse";
import { LoginInput } from "../types/LoginInput";
import { createToken, sendRefreshToken } from "../utils/auth";
import { Context } from "../types/Context";

@Resolver()
export class UserResolver {
  @Query((_return) => [User])
  async users(): Promise<User[]> {
    return await User.find();
  }

  @Mutation((_return) => UserMutationResponse)
  async register(
    @Arg("registerInput")
    registerInput: RegisterInput
  ): Promise<UserMutationResponse> {
    const { username, password } = registerInput;
    const existingUser = await User.findOne({
      where: { username: Equal(username) },
    });
    if (existingUser) {
      return {
        code: 400,
        success: false,
        message: "Username already taken",
      };
    }
    const hashedPassword = await argon2.hash(password);
    const newUser = User.create({
      username,
      password: hashedPassword,
    });
    await newUser.save();
    return {
      code: 200,
      success: true,
      message: "User registration successful",
      user: newUser,
    };
  }
  @Mutation((_return) => UserMutationResponse)
  async login(
    @Arg("loginInput")
    loginInput: LoginInput,
    @Ctx() { res }: Context
  ): Promise<UserMutationResponse> {
    const { username, password } = loginInput;
    const existingUser = await User.findOne({
      where: { username: Equal(username) },
    });
    if (!existingUser) {
      return {
        code: 400,
        success: false,
        message: "Username not found",
      };
    }
    const isPasswordValid = await argon2.verify(
      existingUser.password,
      password
    );
    if (!isPasswordValid)
      return {
        code: 400,
        success: false,
        message: "Password Incorrect",
      };
    sendRefreshToken(res, existingUser);
    return {
      code: 200,
      success: true,
      message: "Logged in successfully",
      user: existingUser,
      accessToken: createToken("accessToken", existingUser),
    };
  }

  @Mutation((_return) => UserMutationResponse)
  async logout(
    @Arg("userId", (_type) => ID) userId: number,
    @Ctx() { res }: Context
  ): Promise<UserMutationResponse> {
    const existingUser = await User.findOne({ where: { id: Equal(userId) } });
    if (!existingUser) {
      return {
        code: 400,
        success: false,
      };
    }

    existingUser.tokenVersion += 1;

    await existingUser.save();

    res.clearCookie(process.env.REFRESH_TOKEN_COOKIE as string, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/refresh_token",
    });

    return { code: 200, success: true };
  }
}
