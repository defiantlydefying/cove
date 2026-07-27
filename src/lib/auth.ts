import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "@/lib/db";

const googleTokenVerifier = new OAuth2Client();

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        return null;
      }

      const user = await prisma.user.findUnique({
        where: { email: credentials.email },
      });

      if (!user || !user.hashedPassword) {
        return null;
      }

      const isValid = await bcrypt.compare(
        credentials.password,
        user.hashedPassword
      );

      if (!isValid) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      };
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    CredentialsProvider({
      id: "native-google",
      name: "Google",
      credentials: {
        idToken: { label: "Google ID token", type: "text" },
      },
      async authorize(credentials) {
        const idToken = credentials?.idToken;
        const audience = process.env.GOOGLE_CLIENT_ID;

        if (!idToken || !audience) {
          return null;
        }

        const ticket = await googleTokenVerifier.verifyIdToken({
          idToken,
          audience,
        });
        const payload = ticket.getPayload();

        if (
          !payload?.sub ||
          !payload.email ||
          !payload.email_verified
        ) {
          return null;
        }

        const providerAccountId = payload.sub;
        const email = payload.email;

        return prisma.$transaction(async (tx) => {
          const account = await tx.account.findUnique({
            where: {
              provider_providerAccountId: {
                provider: "google",
                providerAccountId,
              },
            },
            include: { user: true },
          });

          if (account) {
            return account.user;
          }

          // Match NextAuth's web OAuth behavior: do not silently attach Google
          // to an existing password account with the same email.
          const existingUser = await tx.user.findUnique({
            where: { email },
          });

          if (existingUser) {
            return null;
          }

          const user = await tx.user.create({
            data: {
              email,
              name: payload.name ?? null,
              image: payload.picture ?? null,
            },
          });

          await tx.account.create({
            data: {
              userId: user.id,
              type: "oauth",
              provider: "google",
              providerAccountId,
            },
          });

          return user;
        });
      },
    })
  );

  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  providers,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
};
