import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import { prisma } from "./database.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET ?? "",
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ??
        "http://localhost:5000/api/auth/google/callback",
    },

    async (
      _accessToken,
      _refreshToken,
      profile,
      done,
    ) => {
      try {
        const googleId = profile.id;
        const email =
          profile.emails?.[0]?.value;

        if (!email) {
          return done(
            new Error(
              "Google account does not provide an email address",
            ),
          );
        }

        const name =
          profile.displayName ||
          profile.name?.givenName ||
           email.split("@")[0] || "Google User";

        const avatar =
          profile.photos?.[0]?.value ?? null;

        const user = await prisma.user.upsert({
          where: {
            googleId,
          },

          update: {
            name,
            email,
            avatar,
          },

          create: {
            googleId,
            name,
            email,
            avatar,
          },
        });

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    },
  ),
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(
  async (id: string, done) => {
    try {
      const user =
        await prisma.user.findUnique({
          where: {
            id,
          },
        });

      if (!user) {
        return done(null, false);
      }

      done(null, user);
    } catch (error) {
      done(error);
    }
  },
);

export default passport;