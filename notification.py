import json
import os

import boto3


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
