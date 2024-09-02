import type mail from "nodemailer/lib/mailer";
import { createMailerModule } from ".";

export const createNodemailerModule = createMailerModule((transport: mail) => {
  return {
    id: "nodemailer",
    register: () => transport,
  };
});
