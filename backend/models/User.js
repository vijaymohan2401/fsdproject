const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema
 * FSD-2 Concept: Mongoose Schema definition, validation, pre-save middleware hooks, custom instance methods
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter your full name'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please enter a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // Prevents password from being returned in queries by default
    },
    preferredCurrency: {
      type: String,
      default: 'INR',
      enum: ['INR', 'USD', 'EUR', 'GBP'],
    },
    themePreference: {
      type: String,
      default: 'light',
      enum: ['light', 'dark'],
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt fields
  }
);

// Pre-save hook: Hash password before saving to database
// FSD-2 Concept: Mongoose pre-save middleware for cryptographic security
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method: Compare entered password with stored hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Safe JSON serialization: Exclude sensitive fields
userSchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    _id: this._id,
    name: this.name,
    email: this.email,
    preferredCurrency: this.preferredCurrency,
    themePreference: this.themePreference,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const User = mongoose.model('User', userSchema);

module.exports = User;
