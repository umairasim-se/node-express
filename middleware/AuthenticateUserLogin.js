export const authenticateUser = (req, res, next) => {
  try {
    if (req.session.loggedin) {
      next();
    } else {
      res
        .status(401)
        .json({ message: "User not authenticated", status: "failed" });
    }
  } catch (e) {
    res
      .status(500)
      .json({ message: "Internal Server Error", status: "failed" });
  }
};
