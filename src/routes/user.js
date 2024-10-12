const express = require('express');
const { userAuth } = require('../middlewares/auth');
const userRouter = express.Router();
const ConnectionRequest = require('../models/connectionRequest');
const User = require('../models/user');

const USER_SAFE_DATA = 'firstName lastName photoUrl age gender about skills';

// get all the pending connection requests for the logined user
userRouter.get('/user/requests/received', userAuth, async (req, res) => {
  // .populate('fromUserId', ['firstName', 'lastName']);
  // This query is used to populate the fromUserId field in a document with the corresponding details from the users collection.(we already added ref in connectionRequest schema)
  // It specifically retrieves the firstName and lastName fields of the user associated with the fromUserId.
  try {
    const loggedInUser = req.user;
    const connectionRequests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: 'interested',
    }).populate('fromUserId', USER_SAFE_DATA);

    // }).populate("fromUserId", ["firstName", "lastName"]);
    // }).populate("fromUserId", "firstName lastName");
    // both of them works the same way

    // .populate('fromUserId'); - we will get everything inside user Object (Bad and pathetic way)

    if (!connectionRequests) {
      return res.status(404).json({ message: 'connectionRequests not found!' });
    }
    res.json({
      message: 'Data fetched successfully',
      data: connectionRequests,
    });
  } catch (err) {
    res.status(400).send('ERROR: ' + err.message);
  }
});

userRouter.get('/user/connections', userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser._id, status: 'accepted' },
        { fromUserId: loggedInUser._id, status: 'accepted' },
      ],
    })
      .populate('fromUserId', USER_SAFE_DATA)
      .populate('toUserId', USER_SAFE_DATA);

    console.log(connectionRequests);

    const data = connectionRequests.map((row) => {
      if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return row.toUserId;
      }
      return row.fromUserId;
    });

    res.json({ data });
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

module.exports = userRouter;

// find -returns an array
// findOne returns one object
