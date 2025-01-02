import json


def get_tasks(event, context):
    try:
        user_id = event["requestContext"]["authorizer"]["claims"]["sub"]
        user_role = event["requestContext"]["authorizer"]["claims"]["custom:role"]

        if user_role == "ADMIN":
            response = tasks_table.scan()
        else:
            response = tasks_table.query(
                IndexName="assignee-index",
                KeyConditionExpression="assignee = :assignee",
                ExpressionAttributeValues={":assignee": user_id},
            )

        return {"statusCode": 200, "body": json.dumps(response["Items"])}
    except Exception as e:
        return {"statusCode": 500, "body": json.dumps({"error": str(e)})}
