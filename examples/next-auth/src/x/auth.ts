import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const auth = NextAuth({
  basePath: "/x/auth",
  providers: [
    Credentials({
      credentials: {
        email: {
          type: "email",
        },
      },
      authorize: async (credentials) => {
        return {
          id: "1",
          email: credentials.email as string,
          name: null,
          image: null,
        };
      },
    }),
  ],
});
