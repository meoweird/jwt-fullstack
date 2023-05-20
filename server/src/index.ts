require("dotenv").config();
import { DataSource } from "typeorm";
import { User } from "./entities/User";
import express from "express";
import { createServer } from "http";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageGraphQLPlayground,
} from "apollo-server-core";
import { GreetingResolver } from "./resolvers/greeting";
import { UserResolver } from "./resolvers/user";
import { Context } from "./types/Context";
import refreshTokenRouter from "./routes/refreshTokenRouter";
import cookieParser from "cookie-parser";
import cors from "cors";

const AppDataSource = new DataSource({
  type: "postgres",
  database: "jwt-fullstack",
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  logging: true,
  port: 2707,
  synchronize: true,
  entities: [User],
});

AppDataSource.initialize()
  .then(async () => {
    const app = express();
    app.use(cors({ origin: "http://localhost:3000", credentials: true }));
    app.use(cookieParser());
    app.use("/refresh_token", refreshTokenRouter);
    const httpServer = createServer(app);
    const apolloServer = new ApolloServer({
      schema: await buildSchema({
        validate: false,
        resolvers: [GreetingResolver, UserResolver],
      }),
      plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer }),
        ApolloServerPluginLandingPageGraphQLPlayground,
      ],
      context: ({ req, res }): Pick<Context, "req" | "res"> => ({ req, res }),
    });
    await apolloServer.start();
    apolloServer.applyMiddleware({
      app,
      cors: { origin: "http://localhost:3000", credentials: true },
    });
    const PORT = process.env.PORT || 4000;
    await new Promise((resolve) =>
      httpServer.listen({ port: PORT }, resolve as () => void)
    );
    console.log(
      `Server started on port ${PORT}. GraphQL endpoint on http://localhost:${PORT}${apolloServer.graphqlPath}`
    );
  })

  .catch((err) => console.log(err));
