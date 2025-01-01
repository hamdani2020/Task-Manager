import json
import os

import boto3

cognito = boto3.client("cognito-idp")
SECRET_KEY = os.environ["JWT_SECRET_KEY"]


def auth_handler(event, context):
    try:
        if event["httpMethod"] == "POST":
            body = json.loads(event["body"])
            username = body["username"]
            password = body["password"]

            response = cognito.admin_initiate_auth(
                UserPoolId=os.environ["USER_POOL_ID"],
                ClientId=os.environ["CLIENT_ID"],
                AuthFlow="ADMIN_NO_SRP_AUTH",
                AuthParameters={"USERNAME": username, "PASSWORD": password},
            )

            token = response["AuthenticationResult"]["IdToken"]

            return {"statusCode": 200, "body": json.dumps({"token": token})}
    except Exception as e:
        return {"statusCode": 401, "body": json.dumps({"error": str(e)})}
