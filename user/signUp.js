const AWS = require("aws-sdk");
const { sendResponse } = require("./functions");

const cognito = new AWS.CognitoIdentityServiceProvider();

module.exports.handler = async (event) => {
  try {
    const { email, password, name } = JSON.parse(event.body);
    const { user_pool_id, client_id } = process.env;
    const params = {
      UserPoolId: user_pool_id,
      Username: email,
      UserAttributes: [
        {
          Name: "email",
          Value: email,
        },
        {
          Name: "name",
          Value: name,
        },
      ],
      MessageAction: "SUPPRESS",
    };
    const response = await cognito.adminCreateUser(params).promise();
    if (response.User) {
      const paramsForSetPass = {
        Password: password,
        UserPoolId: user_pool_id,
        Username: email,
        Permanent: true,
      };
      await cognito.adminSetUserPassword(paramsForSetPass).promise();
    }

    const paramsAuth = {
      AuthFlow: "ADMIN_NO_SRP_AUTH",
      UserPoolId: user_pool_id,
      ClientId: client_id,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    };
    const responseAuth = await cognito.adminInitiateAuth(paramsAuth).promise();
    return sendResponse(200, {
      message: "Success",
      token: responseAuth.AuthenticationResult.IdToken,
    });
  } catch (error) {
    const message = error.message ? error.message : "Internal server error";
    return sendResponse(500, { message });
  }
};
