require("dotenv").config();
/**
 * @param {Telegraf.Context} ctx
 * @param {Function(Telegraf.Context): Promise<void>} next
 */
const restrict = (ctx, next) => {
  if (process.env.TRUSTED_USERS.split(",").includes(ctx.from.id.toString())) {
    return next(ctx);
  } else {
    return ctx.reply("You don't have access to this feature.");
  }
};

module.exports = {
  haveAccess: restrict,
};
