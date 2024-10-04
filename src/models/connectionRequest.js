const mongoose = require('mongoose');

const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ['ignored', 'interested', 'accepted', 'rejected'],
        message: `{VALUE} is incorrect status type`,
      },
    },
  },
  { timestamps: true }
);

// ConnectionRequest.find({fromUserId: 273478465864786587, toUserId: 273478465864786587})

// Mongoose pre-hooks

// Pre-hooks are functions that are executed before specific Mongoose operations (e.g., save, validate, remove). They allow you to perform custom logic or modifications to the document before the operation takes place.

// its a kind of middleware

// Types: There are three main types of pre-hooks:
// pre('save', ...): Triggered before a document is saved to the database.
// pre('validate', ...): Triggered before a document is validated against its schema.
// pre('remove', ...): Triggered before a document is removed from the database.

// whenever u r writing a schema method/ pre funtion, use normal function

connectionRequestSchema.pre('save', function (next) {
  const connectionRequest = this;
  // Check if the fromUserId is same as toUserId
  // .eaqual - Compares the equality of this ObjectId with otherID
  if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
    throw new Error('Cannot send connection request to yourself!');
  }
  next();
});

const ConnectionRequestModel = new mongoose.model(
  'ConnectionRequest',
  connectionRequestSchema
);

module.exports = ConnectionRequestModel;



// type: mongoose.Schema.Types.ObjectId  - mongodb _id type

// enum - This specifies the allowed values for the particular field.
  // you can search with enum custom error messages in mongoose doc