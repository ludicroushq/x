import NextAuth from "next-auth";
import Nodemailer from "next-auth/providers/nodemailer";
import { x } from ".";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "../db";

export const auth = NextAuth({
  basePath: "/x/auth",
  adapter: DrizzleAdapter(db),
  providers: [
    Nodemailer({
      server: {},
      sendVerificationRequest: async ({ identifier: email, url }) => {
        x.mailer
          .sendMail({
            to: email,
            subject: "Sign in",
            text: `Sign in: ${url}`,
          })
          .then((info) => {
            console.log("---");
            console.log(info.message.toString().replaceAll("=\r\n", ""));
            console.log("---");
            console.log("Clickable URL: " + url);
          });
      },
    }),
  ],
});
