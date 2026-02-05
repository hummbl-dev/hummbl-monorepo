import json
import os
import time
import logging
import boto3
from botocore.exceptions import ClientError

# Setup
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
S3_BUCKET = os.getenv("S3_BUCKET", "hummbl-telemetry-local")
REGION = os.getenv("AWS_REGION", "us-west-2")

logging.basicConfig(level=LOG_LEVEL)
logger = logging.getLogger("telemetry_lambda")

s3 = boto3.client("s3", region_name=REGION)

def write_to_s3(payload: dict):
    ts = int(time.time())
    key = f"telemetry/{ts}.json"
    try:
        s3.put_object(
            Bucket=S3_BUCKET,
            Key=key,
            Body=json.dumps(payload),
            ContentType="application/json"
        )
        logger.info(f"Wrote telemetry: {key}")
    except ClientError as e:
        logger.error(f"S3 write failed: {e}")
        raise

def handler(event, context):
    """AWS Lambda handler."""
    records = event.get("Records", [])
    for record in records:
        try:
            body = record.get("body") or record
            if isinstance(body, str):
                body = json.loads(body)
            payload = {
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "event_type": body.get("event_type", "unknown"),
                "metadata": body.get("metadata", {}),
                "source": "telemetry_lambda",
            }
            write_to_s3(payload)
        except Exception as e:
            logger.error(f"Error processing record: {e}")
    return {"statusCode": 200, "body": "Processed"}
