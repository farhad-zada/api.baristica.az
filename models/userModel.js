const { Schema, model } = require("mongoose");
const { isMobilePhone } = require("validator");
const bcrypt = require("bcrypt");
const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
    },
    phone: {
      type: String,
      required: true,
      select: false,
      validate: {
        validator: function (v) {
          return isMobilePhone(v, "any");
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      select: false,
      validate: {
        validator: function (v) {
          return validator.isEmail(v);
        },
        message: (props) => `${props.value} is not a valid email!`,
      },
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["default", "baristica", "admin", "superadmin"],
      default: "default",
      select: false,
    },
    resetPasswordToken: {
      type: String,
      select: false,
      unique: true,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

module.exports = model("User", UserSchema);
