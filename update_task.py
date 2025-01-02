import json
import os
from datetime import datetime

import boto3

dynamodb = boto3.resource("dynamodb")
sns = boto3.client("sns")
tasks_table = dynamodb.Table(os.environ["TASKS_TABLE"])


def update_task(event, context):
    try:
        task_id = event["pathParameters"]["task_id"]
        body = json.loads(event["body"])
        timestamp = datetime.utcnow().isoformat()

        response = tasks_table.update_item(
            Key={"task_id": task_id},
            UpdateExpression="SET #status = :status, updated_at = :timestamp",
            ExpressionAttributeNames={"#status": "status"},
            ExpressionAttributeValues={
                ":status": body["status"],
                ":timestamp": timestamp,
            },
            ReturnValues="ALL_NEW",
        )

        updated_task = response["Attributes"]

        # Notify admin of status change
        sns.publish(
            TopicArn=os.environ["TASK_NOTIFICATION_TOPIC"],
            Message=json.dumps({"type": "TASK_UPDATED", "task": updated_task}),
        )

        return {"statusCode": 200, "body": json.dumps(updated_task)}
    except Exception as e:
        return {"statusCode": 500, "body": json.dumps({"error": str(e)})}
