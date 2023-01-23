"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// services/SpacesTable/Create.ts
var Create_exports = {};
__export(Create_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(Create_exports);
var import_aws_sdk = require("aws-sdk");

// services/shared/InputValidator.ts
var MissingFieldError = class extends Error {
};
function validateAsSpaceEntry(arg) {
  if (!arg.name) {
    throw new MissingFieldError("Value for name required!");
  }
  if (!arg.location) {
    throw new MissingFieldError("Value for location required!");
  }
  if (!arg.spaceId) {
    throw new MissingFieldError("Value for spaceId required!");
  }
}

// services/shared/Utils.ts
function getEventBody(event) {
  return typeof event.body == "object" ? event.body : JSON.parse(event.body);
}
function generateRandomId() {
  return Math.random().toString(36).slice(2);
}
function addCorsHeader(result) {
  result.headers = {
    "Content-type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "*"
  };
}

// services/SpacesTable/Create.ts
var TABLE_NAME = process.env.TABLE_NAME;
var dbClient = new import_aws_sdk.DynamoDB.DocumentClient();
async function handler(event, context) {
  const result = {
    statusCode: 200,
    body: "Hello from DynamoDB"
  };
  addCorsHeader(result);
  try {
    const intem = getEventBody(event);
    intem.spaceId = generateRandomId();
    validateAsSpaceEntry(intem);
    await dbClient.put({
      TableName: TABLE_NAME,
      Item: intem
    }).promise();
    result.body = JSON.stringify({
      id: intem.spaceId
    });
  } catch (error) {
    if (error instanceof MissingFieldError) {
      result.statusCode = 403;
    } else {
      result.statusCode = 500;
    }
    result.body = error.message;
  }
  return result;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
