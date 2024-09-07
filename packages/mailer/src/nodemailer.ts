import type Mail from "nodemailer/lib/mailer";
import { MailerModule } from ".";

export class NodemailerModule extends MailerModule {
  private transport: Mail;

  constructor(transport: Mail) {
    super();
    this.transport = transport;
  }

  install(): Mail {
    return this.transport;
  }
}
