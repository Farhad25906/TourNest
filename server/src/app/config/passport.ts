import { Provider, UserRole, UserStatus } from "@prisma/enums";
import bcrypt from "bcryptjs";
import passport, { Profile } from "passport";
import {
  Strategy as GoogleStrategy,
  VerifyCallback,
} from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import { prisma } from "./../lib/prisma";
import envVars from "./env";

passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async (email: string, password: string, done) => {
      try {
        const isUserExist = await prisma.user.findUniqueOrThrow({
          where: {
            email: email,
          },
        });
        if (!isUserExist) {
          return done("User does not exist");
        }
        if (
          isUserExist.status === UserStatus.BLOCKED ||
          isUserExist.status === UserStatus.INACTIVE
        ) {
          return done(`User is ${isUserExist.status}`);
        }
        if (isUserExist.isDeleted) {
          done("User is deleted");
        }
        const passwordMatched = await bcrypt.compare(
          password,
          isUserExist.password as string
        );
        if (!passwordMatched) {
          return done("email and password does not match");
        }
        return done(null, isUserExist);
      } catch (err) {
        done(err);
      }
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: envVars.GOOGLE_CLIENT_ID,
      clientSecret: envVars.GOOGLE_CLIENT_SECRET,
      callbackURL: envVars.GOOGLE_CALLBACK_URL,
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: VerifyCallback
    ) => {
      try {
        const email = profile.emails?.[0].value;
        if (!email) {
          return done(null, false, { message: "No email found" });
        }
        let isUserExist = await prisma.user.findUnique({
          where: {
            email,
          },
        });

        if (isUserExist && isUserExist.isVerified) {
          return done(null, false, { message: "User not verified" });
        }
        if (!isUserExist) {
          isUserExist = await prisma.user.create({
            data: {
              email,
              name: profile.displayName,
              photo: profile.photos?.[0].value,
              role: UserRole.USER,
              isVerified: true,
              auths: {
                create: {
                  provider: Provider.google,
                  providerId: email,
                },
              },
            },
          });
        }
        return done(null, isUserExist);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user: any, done: (err: any, id?: unknown) => void) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done: any) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });
    done(null, user);
  } catch (err) {
    done(err);
  }
});
