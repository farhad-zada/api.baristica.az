const { Schema, model } = require("mongoose");
const { isMobilePhone, isEmail } = require("validator");
const bcrypt = require("bcrypt");

const userStatistics = {
  ordersCompleted: {
    type: Number,
    default: 0,
  },
  myDiscount: {
    type: Number,
    default: 0,
  },
  totalSpent: {
    type: Number,
    default: 0,
  },
  savedMoney: {
    type: Number,
    default: 0,
  },
  totalOrders: {
    type: Number,
    default: 0,
  },
  canceledOrders: {
    type: Number,
    default: 0,
  },
  weight: {
    type: Number,
    default: 0,
  },
  _id: false,
};

const address = {
  name: String,
  city: String,
  entrance: String,
  apartment: String,
  lat: {
    type: Number,
    required: function () {
      return this.lng !== undefined;
    },
  },
  lng: {
    type: Number,
    required: function () {
      return this.lat !== undefined;
    },
  },
  notes: String,
  isPrimary: Boolean,
};

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
      validate: {
        validator: function (v) {
          return isEmail(v);
        },
        message: (props) => `${props.value} is not a valid email!`,
      },
    },
    statistics: userStatistics,
    addresses: [address],
    password: {
      type: String,
      required: true,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: true,
      select: false,
      validate: {
        validator: function (v) {
          return v === this.password;
        },
        message: (props) => `Passwords do not match!`,
      },
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
      unique: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
    passwordChangedAt: {
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
    this.passwordConfirm = undefined;
  }

  next();
});

module.exports = model("User", UserSchema);
