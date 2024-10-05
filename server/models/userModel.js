import mongoose, { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true, // Name is required
    },
    userEmail: {
      type: String,
      required: true,
      unique: true, // Email must be unique
    },
    password: {
      type: String,
      required: true, // Password is required
      minlength: 8,   // Minimum length of 8 characters
    },
    referrerId: {
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', // Points to the user who referred this user (parent)
      default: null, // May not have a referrer (e.g., direct registration)
    },
    referral_level_1: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User'  // Level 1 referrals (direct)
    }],
    referral_level_2: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User'  // Level 2 referrals (indirect)
    }],
    referral_level_3: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User'  // Level 3 referrals (indirect)
    }],
    earnings: {
      type: Number,
      default: 0,  // Track total earnings
    },
    rewards: {
      type: String,
      default: null,  // Track user rewards based on earnings
    },
    isActive: {
      type: Boolean,
      default: true,  // User account is active by default
    },
    createdAt: {
      type: Date,
      default: Date.now,  // Automatically adds the current date
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

// Define and export the model
const userModel = model("User", userSchema);
export default userModel;
