const { Schema, model } = require("mongoose");
const { validate } = require("uuid");

const OrderItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
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
    required: true,
    validate: {
      validator: function (v) {
        return typeof v === "number" && v > 0;
      },
      message: (props) => `${props.value} is not a valid cost!`,
    },
  },
  totalCost: {
    type: Number,
    required: true,
    validate: {
      validator: function (v) {
        return typeof v === "number" && v > 0;
      },
      message: (props) => `${props.value} is not a valid total cost!`,
    },
  },
});

const OrderSchema = new Schema(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: "User",
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
      required: true,
      validate: {
        validator: function (v) {
          return typeof v === "number" && v > 0;
        },
        message: (props) => `${props.value} is not a valid cost!`,
      },
    },
    totalCost: {
      type: Number,
      required: true,
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
      default: 500,
      validate: {
        validator: function (v) {
          return typeof v === "number" && v >= 0;
        },
        message: (props) => `${props.value} is not a valid delivery fee!`,
      },
    },
    status: {
      type: String,
      enum: ["initiated", "paid", "shipped", "delivered", "cancelled"],
      default: "initiated",
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

OrderSchema.pre("save", function (next) {
  this.items.forEach((item) => {
    item.cost = item.product.price * item.quantity;
    item.totalCost = item.cost;
    if (item.discountType === "percentage") {
      item.totalCost = Math.round((item.totalCost * item.discount) / 100);
    } else if (item.discountType === "fixed") {
      item.totalCost = item.totalCost - item.discount;
    }
  });

  this.cost = this.items.reduce((acc, item) => {
    this.totalCost += item.totalCost;
    return acc + item.cost;
  }, 0);
  this.discountType === "percentage"
    ? this.cost - (this.cost * this.discount) / 100
    : this.cost - this.discount;
  if (this.discountType == "percentage") {
    this.totalCost = Math.round((this.totalCost * this.discount) / 100);
  } else if (this.discountType == "fixed") {
    this.totalCost = this.totalCost - this.discount;
  }
  next();
});

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
