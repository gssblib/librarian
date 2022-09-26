import config from "config";
import nodemailer from "nodemailer";

export interface Email {
  from: string;
  to: string[];
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
}

export interface Emailer {
  send(email: Email): Promise<Email>;
}

class FakeEmailer implements Emailer {
  constructor() {
    console.log("using FakeEmailer");
  }

  send(email: Email): Promise<Email> {
    console.log("fake emailer send:", email);
    return Promise.resolve(email);
  }
}

class NodemailerEmailer implements Emailer {
  constructor() {
    console.debug("Using real Node Emailer");
  }

  async send(email: Email): Promise<Email> {
    const result = await emailTransporter.sendMail(email);
    return result;
  }
}

interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  fake?: boolean;
}

const smtpConfig: SmtpConfig = config.get("smtp");

export const emailer =
    smtpConfig.fake ? new FakeEmailer() : new NodemailerEmailer();

function createTransport(): nodemailer.Transporter {
  let transporter = nodemailer.createTransport({
    host: smtpConfig.host,
    port: smtpConfig.port,
    auth: {
      user: smtpConfig.user,
      pass: smtpConfig.password,
    },
  });
  transporter.verify((error, success) => {
    if (error) {
      console.error('Incorrect SMTP Config', error);
    } else {
      console.debug('SMTP Emailer ready.');
    }
  });
  return transporter;
}

export const emailTransporter = createTransport();
