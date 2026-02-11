import { EventEmitter } from 'events';
import { sendEmail } from '../email/send.email';

export const emailEvent = new EventEmitter();

import { template } from '../email/HTML.temp';
import { EmailTypeEnum } from '../../enums/user.enums';

emailEvent.on('cofirm-email', async (data) => {
  try {
    data.subject = EmailTypeEnum.VERIFY_EMAIL;
    data.html = template(data.code, data.firstName, data.subject);
    await sendEmail(data);
  } catch (error) {
    console.log('fail to sent email : ', error);
  }
});
