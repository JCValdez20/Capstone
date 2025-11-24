exports.sendResponseMessage = async (res, status, data, message) => {
  return res.status(status).json({ data: data, message });
};

exports.sendErrorMessage = async (res, status, error) => {
  // Handle both string and Error object
  const errorMessage =
    typeof error === "string"
      ? error
      : error?.message || "Internal Server Error";

  return res.status(status).json({
    message: errorMessage,
    err: errorMessage,
  });
};
