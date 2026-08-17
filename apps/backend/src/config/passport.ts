import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import { prisma } from "./database.js";

passport.use(
  new GoogleStrategy(
    {
      clientID:
        process.env.GOOGLE_CLIENT_ID ?? "",

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
          email.split("@")[0] ||
          "Google User";

        const avatar =
          profile.photos?.[0]?.value ?? null;

        /*
         * Create or update the application user.
         */
        const user =
          await prisma.user.upsert({
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

        /*
         * Ensure the logged-in user has an email sender.
         *
         * Your Sender model has:
         *
         * @@unique([userId, email])
         *
         * so Prisma generates the compound
         * unique key: userId_email
         */
        await prisma.sender.upsert({
          where: {
            userId_email: {
              userId: user.id,
              email: user.email,
            },
          },

          update: {
            name: user.name,
          },

          create: {
            userId: user.id,
            email: user.email,
            name: user.name,
          },
        });

        return done(null, user);
      } catch (error) {
        console.error(
          "Google authentication error:",
          error,
        );

        return done(error);
      }
    },
  ),
);

/**
 * Store the user ID in the session.
 */
passport.serializeUser(
  (user: any, done) => {
    done(null, user.id);
  },
);

/**
 * Load the user from PostgreSQL when
 * restoring the session.
 */
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

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  },
);

export default passport;