import { createRouter, adminQuery } from "./middleware";
import { findAllUsers } from "./queries/users";

export const adminRouter = createRouter({
  users: adminQuery.query(async () => {
    return findAllUsers();
  }),
});
