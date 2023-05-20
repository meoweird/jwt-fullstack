import express from "express";
import { Secret, verify } from "jsonwebtoken";
import { UserAuthPayload } from "../types/UserAuthPayload";
import { User } from "../entities/User";
import { Equal } from "typeorm";
import { sendRefreshToken } from "../utils/auth";
import { createToken } from "../utils/auth";

const router = express.Router();

router.get("/", async (req, res) => {
  const refreshToken = req.cookies[process.env.REFRESH_TOKEN_COOKIE as string];

  if (!refreshToken) return res.sendStatus(401);

  try {
    const decodedUser = verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as Secret
    ) as UserAuthPayload;

    const existingUser = await User.findOne({
      where: { id: Equal(decodedUser.userId) },
    });

    if (!existingUser) return res.sendStatus(401);

    sendRefreshToken(res, existingUser);

    return res.json({
      success: true,
      accessToken: createToken("accessToken", existingUser),
    });
  } catch (error) {
    return res.status(403).json({ message: error });
  }
});

export default router;
