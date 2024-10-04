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

      const toUser = await User.findById(toUserId);
      if (!toUser) {
        return res.status(404).json({ message: 'User not found!' });
      }

      // fromUserId and toUserId: These variables represent the IDs of the two users involved in the connection request.
      // This line uses the findOne() method on the ConnectionRequest model to find a single document that matches the specified criteria.
      // $or - This specifies an OR condition within the query. It means that the query will match documents that satisfy either of the following criteria:
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

module.exports = requestRouter;
