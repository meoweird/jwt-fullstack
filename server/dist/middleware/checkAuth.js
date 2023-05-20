"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAuth = void 0;
const apollo_server_express_1 = require("apollo-server-express");
const jsonwebtoken_1 = require("jsonwebtoken");
const checkAuth = ({ context }, next) => {
    try {
        const authHeader = context.req.header("Authorization");
        const accessToken = authHeader && authHeader.split(" ")[1];
        if (!accessToken)
            throw new apollo_server_express_1.AuthenticationError("Not authenicated to perform GraphQL operations");
        const decodedUser = (0, jsonwebtoken_1.verify)(accessToken, process.env.ACCESS_TOKEN_SECRET);
        context.user = decodedUser;
        return next();
    }
    catch (error) {
        throw new apollo_server_express_1.AuthenticationError(`${JSON.stringify(error)}`);
    }
};
exports.checkAuth = checkAuth;
//# sourceMappingURL=checkAuth.js.map