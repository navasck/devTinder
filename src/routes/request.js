const express = require('express');
const requestRouter = express.Router();

const ConnectionRequest = require('../models/connectionRequest');
const User = require('../models/user');

// for checking authorized or not
const { userAuth } = require('../middlewares/auth');

requestRouter.post(
  '/request/send/:status/:toUserId',
  userAuth,
  async (req, res) => {
    try {
      // req.user  - fromUser
      // logined users id
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      const allowedStatus = ['ignored', 'interested'];
      if (!allowedStatus.includes(status)) {
        return res
          .status(400)
          .json({ message: 'Invalid status type: ' + status });
      }
      // checking toUserId is a valid user in our database
      const toUser = await User.findById(toUserId);
      if (!toUser) {
        return res.status(404).json({ message: 'User not found!' });
      }

      // fromUserId and toUserId: These variables represent the IDs of the two users involved in the connection request.
      // This line uses the findOne() method on the ConnectionRequest model to find a single document that matches the specified criteria.
      // $or - This specifies an OR condition within the query. It means that the query will match documents that satisfy either of the following criteria:
      // here we are querying on combination of 'fromUserI & toUserId'. so for improving performance added index for this 2 fields fro schema page.
      const existingConnectionRequest = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });
      if (existingConnectionRequest) {
        return res
          .status(400)
          .send({ message: 'Connection Request Already Exists!!' });
      }

      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      // connection request will save into the database
      const data = await connectionRequest.save();

      res.json({
        message:
          req.user.firstName + ' is ' + status + ' in ' + toUser.firstName,
        data,
      });
    } catch (err) {
      res.status(400).send('ERROR: ' + err.message);
    }
  }
);

requestRouter.post(
  '/request/review/:status/:requestId',
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const { status, requestId } = req.params;
      const allowedStatus = ['accepted', 'rejected'];
      if (!allowedStatus.includes(status)) {
        return res
          .status(400)
          .json({ message: 'Invalid status type: ' + status });
      }

      // to find the connectionRequest with the given id from database
      // toUserid: loggedinUser._id - to confirm the connectionRequest of loggedinUser (as toUserid)
      //  status: 'interested', -  to find the connectionRquest with status: 'interested', that only we are allowing to convert to 'accepted' or 'rejected'
      const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: 'interested',
      });
      console.log(
        'connectionRequest review',
        requestId,
        loggedInUser._id,
        connectionRequest
      );
      if (!connectionRequest) {
        return res
          .status(404)
          .json({ message: 'connection request not found' });
      }
      connectionRequest.status = status;
      const data = await connectionRequest.save();
      res.json({ message: 'connection request ' + status, data });
    } catch (err) {
      res.status(400).send('ERROR: ' + err.message);
    }
  }
);

module.exports = requestRouter;

// Role of Indexes in MongoDB

// Indexes in MongoDB are crucial for improving query performance, especially when dealing with large datasets. They act as lookup tables, allowing MongoDB to quickly locate specific documents based on the values of specified fields.
