import mongoose from "mongoose";
import bcrypt from "bcrypt";

const collection = "users";

const schema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  email: {
    type: String,
    unique: true,
  },
  age: Number,
  passwordHash: String,
});

schema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.passwordHash = await bcrypt.hash(user.password, 10);
  }
  next();
});
const userModel = mongoose.model(collection, schema);

export default userModel;
