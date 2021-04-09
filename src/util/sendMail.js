import sendgrid from '@sendgrid/mail';

let apiKey;

/**
 *
 * @param config {ConfigBase}
 * @param toEmail {string}
 * @param fileName {string}
 */
export default (config, toEmail, fileName, text) => {
  if (!config.USE_MAIL) return false;
  if (apiKey === null) {
    apiKey = config.SENDGRID_API_KEY;
    sendgrid.setApiKey(apiKey);
  }

  const mail = {
    from: config.SENDER_EMAIL,
    to: toEmail,

    subject: 'Notification by microCDN',
    text: text,
  };

  sendgrid.send(mail).catch(err => console.log(err));
};
