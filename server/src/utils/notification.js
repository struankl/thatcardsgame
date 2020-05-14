import AWS from 'aws-sdk';

const {region} = process.env;
AWS.config.update({region});
const sns = new AWS.SNS();

export const sendNotification = async ({message}) => {
  const epistle = typeof message !== 'string' ? JSON.stringify(message) : message;
  const topic = process.env[`NOTIFY_TOPIC`];
  console.log('Publishing message:', JSON.stringify(epistle), 'to topic:', topic);
  try {
    const result = await sns.publish({
      TopicArn: topic,
      Message: epistle
    }).promise();

    console.log('message published to SNS: ', result);
    return result;
  } catch (err) {
    console.log('error publishing to SNS:', err);
    throw err;
  }
};
