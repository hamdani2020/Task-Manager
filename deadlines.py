import json
import os
from datetime import datetime, timedelta

import boto3

dynamodb = boto3.resource("dynamodb")
sns = boto3.client("sns")
tasks_table = dynamodb.Table(os.environ["TASKS_TABLE"])


def check_deadlines(event, context):
    try:
        current_time = datetime.utcnow()

        # Scan for tasks approaching deadline
        response = tasks_table.scan(
            FilterExpression="#status <> :completed AND deadline <= :warning_time",
            ExpressionAttributeNames={"#status": "status"},
            ExpressionAttributeValues={
                ":completed": "COMPLETED",
                ":warning_time": (current_time + timedelta(days=1)).isoformat(),
            },
        )

        for task in response["Items"]:
            # Send deadline warning notification
            sns.publish(
                TopicArn=os.environ["TASK_NOTIFICATION_TOPIC"],
                Message=json.dumps({"type": "DEADLINE_WARNING", "task": task}),
            )

    except Exception as e:
        print(f"Error checking deadlines: {str(e)}")
        raise e
