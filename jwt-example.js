const jwt = require("jsonwebtoken");

const user = {
  id: "12345",
  username: "Aya",
  role: "Admin",
};

const password = "shhhh-our-secret"; //server side only (its a secret :D)

/**
 * creating a token
 */
const token = jwt.sign(user, password);

console.log(token);

/**
 * verifying the token
 */

try {
  const verified = jwt.verify(token, password);
  console.log(verified);
} catch (error) {
  console.log("Invalid token");
}

/**
 * modifying the token then verifying it
 */

try {
  const verified = jwt.verify(token + "anything", password);
  console.log(verified);
} catch (error) {
  console.log("Invalid token");
}
