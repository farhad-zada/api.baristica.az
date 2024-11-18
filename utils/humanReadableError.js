module.exports = (validationResult) =>
  validationResult.error.details
    .map((err) => {
      return `Field "${err.context.key}" ${err.message.replace(/"/g, "")}`;
    })
    .join(", ");
