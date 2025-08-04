exports.sendResponseMessage = async (res, status, data, message) => {
  return res.status(status).json({ data: data, message });
};

exports.sendErrorMessage = async (res, status, error) => {
  return res.status(status).json({
    message: "Internal Server Error",
    err: error.message,
  });
};
