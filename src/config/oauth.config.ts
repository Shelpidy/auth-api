import * as dotenv from "dotenv";

dotenv.config();

export const oauthConfig = {
  google: {
    clientID: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    callbackURL: `http://localhost:${process.env.PORT}/api/auth/google/callback`,
  },
  microsoft: {
    clientID: process.env.MICROSOFT_CLIENT_ID || "",
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET || "",
    callbackURL: `http://localhost:${process.env.PORT}/api/auth/microsoft/callback`,
  },
  jwt: {
    secret: process.env.JWT_SECRET || "",
    expiresIn: "24h",
  },
};
