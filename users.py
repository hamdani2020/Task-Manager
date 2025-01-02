import json

import boto3
from botocore.exceptions import ClientError

# Initialize Cognito client
cognito = boto3.client("cognito-idp")
USER_POOL_ID = "eu-west-1_qpSD45zzZ"


def lambda_handler(event, context):
    try:
        # Get user information from the request context
        authorizer = event.get("requestContext", {}).get("authorizer", {})
        user_role = authorizer.get("claims", {}).get("custom:role", "")

        # Check if user has admin role
        if user_role.upper() != "ADMIN":
            return {
                "statusCode": 403,
                "headers": {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Credentials": True,
                },
                "body": json.dumps({"message": "Unauthorized. Admin access required."}),
            }

        # List users from Cognito user pool
        response = cognito.list_users(
            UserPoolId=USER_POOL_ID,
            AttributesToGet=[
                "email",
                "custom:role",
                "name",
            ],
        )

        # Process users and format response
        users = []
        for user in response["Users"]:
            user_attributes = {
                attr["Name"]: attr["Value"] for attr in user["Attributes"]
            }
            users.append(
                {
                    "username": user["Username"],
                    "email": user_attributes.get("email", ""),
                    "role": user_attributes.get("custom:role", "MEMBER"),
                    "firstName": user_attributes.get("given_name", ""),
                    "lastName": user_attributes.get("family_name", ""),
                    "status": user["UserStatus"],
                }
            )

        # Filter out admin users if needed
        member_users = [user for user in users if user["role"].upper() != "ADMIN"]

        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": True,
            },
            "body": json.dumps({"users": member_users, "count": len(member_users)}),
        }

    except ClientError as e:
        print(f"Error: {str(e)}")
        error_message = e.response["Error"]["Message"]
        error_code = e.response["Error"]["Code"]

        if error_code == "ResourceNotFoundException":
            return {
                "statusCode": 404,
                "headers": {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Credentials": True,
                },
                "body": json.dumps({"message": "User pool not found"}),
            }

        return {
            "statusCode": 500,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": True,
            },
            "body": json.dumps({"message": error_message}),
        }

    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            "statusCode": 500,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": True,
            },
            "body": json.dumps({"message": "Internal server error"}),
        }
