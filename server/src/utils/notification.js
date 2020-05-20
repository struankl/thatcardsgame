import AWS from "aws-sdk";

const { region } = process.env;
AWS.config.update({ region });
const sns = new AWS.SNS();
const sqs = new AWS.SQS({apiVersion: '2012-11-05'});

const sendSNS = async ({ message, topicName }) => {
  const topic = process.env[topicName];
  const epistle =
    typeof message !== "string" ? JSON.stringify(message) : message;
  console.log(
    "Publishing message:",
    JSON.stringify(epistle),
    "to topic:",
    topic
  );
  try {
    const result = await sns
      .publish({
        TopicArn: topic,
        Message: epistle,
      })
      .promise();

    console.log("message published to SNS: ", result);
    return result;
  } catch (err) {
    console.log("error publishing to SNS:", err);
    throw err;
  }
};

const sendSQS = async ({ message, topicName, delay }) => {
  const params = {
    DelaySeconds: delay,
    MessageBody: JSON.stringify({ message, topic: topicName }),
    QueueUrl: process.env["DELAYED_NOTIFICATION_QUEUE"],
  };

  try {
    const sqsStatus = await sqs.sendMessage(params).promise();
    console.log("sent sqs id:", sqsStatus.MessageId);
  } catch (error) {
    console.log("error:", `failed to send message ${error}`);
  }
};

export const sendNotification = async ({
  message,
  topic: topicName = `NOTIFY_TOPIC`,
  delay = 0,
}) =>
  !delay
    ? sendSNS({ message, topicName })
    : sendSQS({ message, topicName, delay });
