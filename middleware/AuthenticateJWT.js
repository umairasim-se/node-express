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

      if (user.exp < Date.now() / 1000) {
        res.status(403).json({ message: "Token expired", status: "failed" });
      } else {
        next();
      }
    });
  } else {
    res.status(400).json({ message: "Token not Provided", status: "failed" });
  }
};

export default authenticateJWT;
