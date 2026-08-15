import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import * as Api from "../lib/api-stack";

test("API stack includes a dedicated user rates CRUD lambda", () => {
  const app = new cdk.App();
  const stack = new Api.ApiStack(app, "MyTestStack");
  const template = Template.fromStack(stack);

  const lambdas = template.findResources("AWS::Lambda::Function");
  expect(Object.keys(lambdas).some((logicalId) => logicalId.includes("UserRatesLambda"))).toBe(true);

  const methods = template.findResources("AWS::ApiGateway::Method");
  expect(Object.keys(methods).length).toBeGreaterThan(0);
});
