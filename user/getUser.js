const { dbFunctions } = require("./db");

const getUser = async (event) => {
  const { email } = event.pathParameters;

  const result = await dbFunctions.get(email);

  return {
    statusCode: 200,
    body: JSON.stringify(result.Item),
  };
};

module.exports = {
  handler: getUser,
};
