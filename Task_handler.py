import json
import os
import uuid
from datetime import datetime, timedelta

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


# 3. Notification Handler
def process_notifications(event, context):
    for record in event["Records"]:
        message = json.loads(record["Sns"]["Message"])
        task = message["task"]

        if message["type"] == "TASK_ASSIGNED":
            # Send email notification using SES
            ses = boto3.client("ses")
            ses.send_email(
                Source=os.environ["NOTIFICATION_EMAIL_FROM"],
                Destination={"ToAddresses": [task["assignee"]]},
                Message={
                    "Subject": {"Data": f"New Task Assigned: {task['title']}"},
                    "Body": {
                        "Text": {
                            "Data": f"You have been assigned a new task:\n\nTitle: {task['title']}\nDescription: {task['description']}\nDeadline: {task['deadline']}"
                        }
                    },
                },
            )

        elif message["type"] == "TASK_UPDATED":
            # Send status update notification
            ses = boto3.client("ses")
            ses.send_email(
                Source=os.environ["NOTIFICATION_EMAIL_FROM"],
                Destination={"ToAddresses": [os.environ["ADMIN_EMAIL"]]},
                Message={
                    "Subject": {"Data": f"Task Status Updated: {task['title']}"},
                    "Body": {
                        "Text": {
                            "Data": f"Task status has been updated:\n\nTitle: {task['title']}\nNew Status: {task['status']}\nUpdated At: {task['updated_at']}"
                        }
                    },
                },
            )


# 4. Deadline Checker
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
