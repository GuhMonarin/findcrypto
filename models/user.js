import database from "infra/database.js";
import { ValidationError } from "infra/errors";

async function create(userInputValues) {
  await validationUniqueEmail(userInputValues.email);
  await validationUniqueUsername(userInputValues.username);

  const newUser = await runInsertQuery(userInputValues);
  return newUser;

  async function validationUniqueUsername(username) {
    const results = await database.query({
      text: `
      SELECT
        username
      FROM
        users
      WHERE
        LOWER(username) = LOWER($1)
      ;`,
      values: [username],
    });

    if (results.rowCount > 0) {
      throw new ValidationError({
        message: "O usuario já está sendo usado",
        action: "Utiliza outro usuário para se cadastrar",
      });
    }
  }

  async function validationUniqueEmail(email) {
    const results = await database.query({
      text: `
      SELECT
        email
      FROM
        users
      WHERE
        LOWER(email) = LOWER($1)
      ;`,
      values: [email],
    });

    if (results.rowCount > 0) {
      throw new ValidationError({
        message: "O email já está sendo usado",
        action: "Utiliza outro email para se cadastrar",
      });
    }
  }
}

async function runInsertQuery(userInputValues) {
  const results = await database.query({
    text: `
      INSERT INTO 
        users (username, email, password) 
      VALUES
        ($1, $2, $3)
      RETURNING
        *
      ;`,
    values: [
      userInputValues.username,
      userInputValues.email,
      userInputValues.password,
    ],
  });

  return results.rows[0];
}

const user = {
  create,
};

export default user;
