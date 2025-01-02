import json
import os
import uuid
from datetime import datetime

import boto3

dynamodb = boto3.resource("dynamodb")
sns = boto3.client("sns")
tasks_table = dynamodb.Table(os.environ["TASKS_TABLE"])


def create_task(event, context):
    try:
        body = json.loads(event["body"])
        task_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().isoformat()

        task = {
            "task_id": task_id,
            "title": body["title"],
            "description": body["description"],
            "assignee": body["assignee"],
            "deadline": body["deadline"],
            "status": "PENDING",
            "created_at": timestamp,
            "updated_at": timestamp,
        }

        tasks_table.put_item(Item=task)

        # Notify assignee
        sns.publish(
            TopicArn=os.environ["TASK_NOTIFICATION_TOPIC"],
            Message=json.dumps({"type": "TASK_ASSIGNED", "task": task}),
        )

        return {"statusCode": 201, "body": json.dumps(task)}
    except Exception as e:
        return {"statusCode": 500, "body": json.dumps({"error": str(e)})}
