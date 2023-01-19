import jwt from "jsonwebtoken";

const authenticateJWT = async function (req, res, next) {
  const secret_key = process.env.SECRET_KEY;
  const authHeaders = req.headers.authorization;

  if (authHeaders) {
    const token = authHeaders.split(" ")[1];

    jwt.verify(token, secret_key, (err, user) => {
      if (err) {
        return res
          .status(401)
          .json({ message: "Invalid Token", status: "failed" });
      }
      next();
    });
  } else {
    res.status(400).json({ message: "Invalid Token", status: "failed" });
  }
};

export default authenticateJWT;
