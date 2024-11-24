const { Schema, model } = require("mongoose");
const validator = require("validator");

const CustomerSchema = new Schema({
  _id: false,
  id: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  name: {
    type: String,
    required: true,
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

const OrderItemSchema = new Schema(
  {
    product: {
      type: String,
      refPath: "productType",
      required: true,
    },
    productType: {
      type: String, 
      enum: ["Coffee", "Machine", "Accessory"],
      required: [true, "Product type is mandatory"]
    },
    quantity: {
      type: Number,
      required: true,
      immutable: [true, "Trying to update quantity which is not allowed! 🤨"],
    },
    price: {
      type: Number,
      required: true,
      immutable: [true, "Trying to update price which is not allowed! 🤨"],
    },
  },
  {
    virtuals: true,
  }
);

OrderItemSchema.virtual("cost").get(function () {
  return (this.price * this.quantity).toPrecision(2);
});

const deliveryRequiredField = function () {
  return this.deliveryMethod === "delivery";
};

const OrderSchema = new Schema(
  {
    customer: {
      type: CustomerSchema,
      required: [true, "Customer data is required!"],
    },
    items: {
      type: [OrderItemSchema],
      required: [true, "Items is required!"],
      validate: {
        validator: function (v) {
          return v.length > 0;
        },
        message: (props) => `Order must have at least one item!`,
      },
    },
    deliveryHour: {
      type: String,
      validate: {
        validator: function (v) {
          return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/.test(v); // Regex for HH:mm or HH:mm:ss
        },
        message: (props) => `${props.value} is not a valid time!`,
      },
      required: [deliveryRequiredField, "Delivery hour is required"],
    },
    deliveryDate: {
      type: Date,
      required: deliveryRequiredField,
    },
    deliveryAddress: {
      type: Schema.Types.ObjectId,
      ref: "User.addresses",
      required: [deliveryRequiredField, "Delivery address is required"],
    },
    deliveryMethod: {
      type: String,
      enum: ["delivery", "pickup"],
      required: [true, "Delivery method not specified!"],
    },
    cost: {
      type: Number,
      validate: {
        validator: function (v) {
          return typeof v === "number" && v > 0;
        },
        message: (props) => `${props.value} is not a valid cost!`,
      },
      required: [true, "Cost must be specified!"],
      immutable: true
    },
    totalCost: {
      type: Number,
      validate: {
        validator: function (v) {
          return typeof v === "number" && v > 0;
        },
        message: (props) => `${props.value} is not a valid total cost!`,
      },
      required: [true, "Total cost must be specified!"],
      immutable: true
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
        "delivered",
        "cancelled by customer",
        "cancelled by baristica",
      ],
      default: "initiated",
    },
    transaction: {
      type: String,
      required: [
        function () {
          this.status !== "initiated";
        },
        "Transaction is required!",
      ],
    },
    notes: {
      type: String,
    },
    seen: [Number],
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
    virtuals: true,
  }
);

OrderSchema.pre("delete", function (next) {
  this.deleted = true;
  this.deletedAt = Date.now();
  next();
});

OrderSchema.pre(/^find/, function (next) {
  this.find({ deleted: { $ne: true } });

  // Check if the 'user' field is being populated
  if (this.getPopulatedPaths().includes("user")) {
    this.populate({
      path: "user",
      select: "name email", 
    });
  }

  next();
});

const Order = model("Order", OrderSchema);

module.exports = Order;
