import nodemailer from "nodemailer";

export const mailer = nodemailer.createTransport({
  streamTransport: true,
  newline: "unix",
  buffer: true,
});
