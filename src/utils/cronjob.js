const cron = require('node-cron');
const { subDays, startOfDay, endOfDay } = require('date-fns');
const ConnectionRequestModel = require('../models/connectionRequest');
const sendEmail = require('./sendMail');
const User = require('../models/user');

// node-cron is a powerful tool for scheduling tasks (like sending emails, running backups, etc.) using cron expressions.
// '* * * * * *' - this string defines that you have to run this job every second
// crontab.guru

// cron.schedule('* * * * *', async () => {
//   console.log('Hello World, ' + new Date());
// });

// This job will run at 8 AM in the morning everyday
cron.schedule('* * * * *', async () => {
  // Send emails to all people who got requests the previous day
  try {
    const yesterday = subDays(new Date(), 1);

    const yesterdayStart = startOfDay(yesterday);
    const yesterdayEnd = endOfDay(yesterday);

    const pendingRequests = await ConnectionRequestModel.find({
      status: 'interested',
      toUserId: '679f1837272e7a40012b6757',
      // createdAt: {
      //   $gte: yesterdayStart,
      //   $lt: yesterdayEnd,
      // },
    }).populate('fromUserId toUserId');

    const listOfEmails = [
      ...new Set(pendingRequests.map((req) => req.fromUserId.emailId)),
    ];

    console.log('listOfEmails', listOfEmails);

    for (const email of listOfEmails) {
      // Send Emails
      try {
        const res = await sendEmail.run(
          'New Friend Requests pending for ' + email,
          'There are so many frined reuests pending, please login to DevTinder.in and accept or reject the requests.',
          'cknavas123@gmail.com'
        );
        console.log(res);
      } catch (err) {
        console.log(err);
      }
    }
  } catch (err) {
    console.error(err);
  }
});
