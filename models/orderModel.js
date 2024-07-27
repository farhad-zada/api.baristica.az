const { Schema, model } = require("mongoose");
const validator = require("validator");

const OptionSchema = new Schema({
  id: {
    type: Schema.Types.ObjectId,
    ref: "Product.option",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    validate: {
      validator: function (v) {
        return typeof v === "number" && v > 0;
      },
      message: (props) => `${props.value} is not a valid quantity!`,
    },
  },
  price: {
    type: Number,
    required: true,
    validate: {
      validator: function (v) {
        return typeof v === "number" && v > 0;
      },
      message: (props) => `${props.value} is not a valid price!`,
    },
  },
  cost: {
    type: Number,
    validate: {
      validator: function (v) {
        return typeof v === "number" && v > 0;
      },
      message: (props) => `${props.value} is not a valid cost!`,
    },
  },
});

const OrderItemSchema = new Schema({
  id: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  options: {
    type: [OptionSchema],
    required: true,
    validate: {
      validator: function (v) {
        return v.length > 0;
      },
      message: (props) => `Order item must have at least one option!`,
    },
  },
  discount: {
    type: Number,
    default: 0,
  },
  discountType: {
    type: String,
    enum: ["percentage", "fixed"],
  },
  cost: {
    type: Number,
    validate: {
      validator: function (v) {
        return typeof v === "number" && v > 0;
      },
      message: (props) => `${props.value} is not a valid cost!`,
    },
  },
  totalCost: {
    type: Number,
    validate: {
      validator: function (v) {
        return typeof v === "number" && v > 0;
      },
      message: (props) => `${props.value} is not a valid total cost!`,
    },
  },
});

const CustomerSchema = new Schema({
  id: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
    required: true,
    validate: {
      validator: validator.isMobilePhone,
      message: (props) => `${props.value} is not a valid phone number!`,
    },
  },
  lastname: {
    type: String,
  },
});

const deliveryRequiredField = function () {
  return this.deliveryMethod === "delivery";
};

const OrderSchema = new Schema(
  {
    customer: {
      type: CustomerSchema,
      required: true,
    },
    orderFor: {
      type: String,
    },
    deliveryHours: {
      from: {
        type: String,
        required: deliveryRequiredField(),
      },
      to: {
        type: String,
        required: deliveryRequiredField(),
      },
      _id: false,
    },
    deliveryDate: {
      type: Date,
      required: deliveryRequiredField(),
    },
    deliveryAddress: {
      type: String,
      required: deliveryRequiredField(),
    },
    deliveryEnterance: {
      type: String,
    },
    deliveryFloor: {
      type: String,
    },
    deliveryApartment: {
      type: String,
    },
    deliveryMethod: {
      type: String,
      enum: ["delivery", "pickup"],
      required: true,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: function (v) {
          return v.length > 0;
        },
        message: (props) => `Order must have at least one item!`,
      },
    },
    discount: {
      type: Number,
      default: 0,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      default: "percentage",
    },
    cost: {
      type: Number,
      validate: {
        validator: function (v) {
          return typeof v === "number" && v > 0;
        },
        message: (props) => `${props.value} is not a valid cost!`,
      },
    },
    totalCost: {
      type: Number,
      validate: {
        validator: function (v) {
          return typeof v === "number" && v > 0;
        },
        message: (props) => `${props.value} is not a valid total cost!`,
      },
    },
    deliveryFee: {
      type: Number,
      required: true,
      validate: {
        validator: function (v) {
          return typeof v === "number" && v >= 0;
        },
        message: (props) => `${props.value} is not a valid delivery fee!`,
      },
    },
    language: {
      type: String,
      enum: ["az", "en", "ru"],
      required: true,
    },
    status: {
      type: String,
      enum: [
        "initiated",
        "paid",
        "shipped",
        "delivered",
        "cancelled by customer",
        "cancelled by baristica",
      ],
      default: "initiated",
    },
    transaction: {
      type: String,
    },
    notes: {
      type: String,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

OrderSchema.pre("delete", function (next) {
  this.deleted = true;
  this.deletedAt = Date.now();
  next();
});

OrderSchema.pre(/^find/, function (next) {
  this.find({ deleted: { $ne: true } });
  next();
});

const Order = model("Order", OrderSchema);

module.exports = Order;
