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

userRouter.get('/feed', userAuth, async (req, res) => {
  try {
    // user shoud'nt see his own cards
    // user shoud'nt see his connections cards
    // user shoud'nt see cards that already ignored & send connection request already

    // http://localhost:7777/feed?limit=10&skip=0&page=1

    const loggedInUser = req.user;

    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 5;
    limit = limit > 50 ? 50 : limit;
    const skip = (page - 1) * limit;

    // find all the connections requests (sent + received)

    // The $or operator allows for multiple conditions to be combined logically.

    const connectionRequests = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select('fromUserId  toUserId');

    // new Set(): This expression creates a new instance of the Set data structure. A Set is a collection of unique values. It does not allow duplicate elements.
    // Add user IDs to the set -     hideUsersFromFeed.add(123);
    // Remove a user ID from the set -     hideUsersFromFeed.delete(456);

    const hideUsersFromFeed = new Set(); // this peoples are people whom you  need to hide from your feed
    connectionRequests.forEach((req) => {
      hideUsersFromFeed.add(req.fromUserId.toString());
      hideUsersFromFeed.add(req.toUserId.toString());
    });

    console.log('hideUsersFromFeed', hideUsersFromFeed);

    // The query uses the $and operator with two sub-conditions:
    // _id: { $nin: Array.from(hideUsersFromFeed) } excludes users from the feed whose IDs are present in the //        hideUsersFromFeed set.
    // _id: { $ne: loggedInUser._id } excludes the logged-in user from the results.

    const users = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUsersFromFeed) } },
        { _id: { $ne: loggedInUser._id } },
      ],
    })
      .select(USER_SAFE_DATA)
      .skip(skip)
      .limit(limit);

    // .skip(skip) .limit(limit)
    // Applies pagination based on the previously calculated skip and limit values.

    res.json({ data: users });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = userRouter;

// find -returns an array
// findOne returns one object

// .select('fromUserId toUserId'):
// This part of the query specifies which fields to include in the result.
// Only the fromUserId and toUserId fields will be returned for each connection request.
// This reduces the amount of data transferred and can improve performance.




// const page = parseInt(req.query.page) || 1;
// Extracts the page parameter from the query string. If not provided, defaults to 1.
// Parses the value to an integer (parseInt).


// const skip = (page - 1) * limit;
// Calculates the number of documents to skip based on the current page and limit. Used for pagination in the database query.



// select:
// Purpose: Specifies which fields to include or exclude from the query results.
// Syntax:
// select(fields): Includes only the specified fields.
// select({ fields: 1 }): Explicitly includes the specified fields.
// select({ fields: 0 }): Excludes the specified fields.
// Example:
// db.users.find().select("name email"); includes only the name and email fields.
// db.users.find().select({ name: 1, age: 0 }); includes name but excludes age.


// skip:
// Purpose: Skips a specified number of documents from the beginning of the result set.
// Syntax:
// skip(number): Skips the specified number of documents.
// Example:
// db.users.find().skip(5); skips the first 5 documents.


// limit:
// Purpose: Limits the number of documents returned by the query.
// Syntax:
// limit(number): Limits the result set to the specified number of documents.
// Example:
// db.users.find().limit(10); returns only the first 10 documents.


// db.users.find().select("name email").skip(5).limit(10);
// Selects only the name and email fields, skips the first 5 documents, and returns a maximum of 10 documents.

// Array.from
// The Array.from() method creates a new array from an array-like object or iterable.
// It's a versatile tool for converting various objects into arrays.

// Array.from(arrayLike, [mapFn], [thisArg])
// arrayLike: An array-like object or iterable (e.g., strings, arguments object, NodeLists, typed arrays).
// mapFn: An optional mapping function to be called for each element in the array-like object. It takes the element value, index, and the original array-like object as arguments.
// thisArg: An optional value to be used as the this value when calling the mapFn.


// eg:1  const array = Array.from({ length: 5 }, () => 0); // [0, 0, 0, 0, 0]
// Create an array with a specified length and initial values:

// eg:2 const numbers = [1, 2, 3];
// const squared = Array.from(numbers, (num) => num * num); // [1, 4, 9]


// Major Operators in MongoDB
// MongoDB provides a rich set of operators to perform various operations on data. Here are some of the most commonly used operators:

// Comparison Operators
// $eq: Equal to
// $ne: Not equal to
// $gt: Greater than
// $gte: Greater than or equal to
// $lt: Less than
// $lte: Less than or equal to  
// $in: In an array
// $nin: Not in an array
// $exists: Checks if a field exists


// Logical Operators
// $and: Logical AND
// $or: Logical OR
// $nor: Logical NOR
// $not: Logical NOT


// Element Operators
// $size: Checks the size of an array
// $type: Checks the type of a value

// Array Operators
// $push: Adds elements to an array
// $addToSet: Adds elements to an array, ensuring uniqueness
// $pop: Removes elements from an array
// $pull: Removes elements from an array
// $pullAll: Removes all elements from an array
// $position: Specifies the position at which an element should be added or removed

// Update Operators
// $inc: Increments or decrements a numerical value
// $set: Sets the value of a field
// $unset: Removes a field
// $setOnInsert: Sets the value of a field if the document is being inserted
// $currentDate: Sets the value of a field to the current date and time

// Aggregation Operators
// $project: Projects fields into the output
// $match: Filters documents based on a query
// $group: Groups documents by a specified field and calculates aggregations
// $sort: Sorts documents by a specified field
// $limit: Limits the number of documents returned
// $skip: Skips a specified number of documents
// $unwind: Decomposes an array field
// $lookup: Joins two collections

// These are just a few of the many operators available in MongoDB. The specific operators you'll use will depend on your data and the types of queries you need to perform.