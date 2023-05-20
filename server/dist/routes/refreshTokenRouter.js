"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = require("jsonwebtoken");
const User_1 = require("../entities/User");
const typeorm_1 = require("typeorm");
const auth_1 = require("../utils/auth");
const auth_2 = require("../utils/auth");
const router = express_1.default.Router();
router.get("/", async (req, res) => {
    const refreshToken = req.cookies[process.env.REFRESH_TOKEN_COOKIE];
    if (!refreshToken)
        return res.sendStatus(401);
    try {
        const decodedUser = (0, jsonwebtoken_1.verify)(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const existingUser = await User_1.User.findOne({
            where: { id: (0, typeorm_1.Equal)(decodedUser.userId) },
        });
        if (!existingUser)
            return res.sendStatus(401);
        (0, auth_1.sendRefreshToken)(res, existingUser);
        return res.json({
            success: true,
            accessToken: (0, auth_2.createToken)("accessToken", existingUser),
        });
    }
    catch (error) {
        return res.status(403).json({ message: error });
    }
});
exports.default = router;
//# sourceMappingURL=refreshTokenRouter.js.map