import { sendNotification } from "../utils/notification";

export const handler = (event) =>
  Promise.all(
    event.Records.map((record) => {
      const { message, topic } = JSON.parse(record.body);
      console.log("Message received from SQS:", record.body);
      return sendNotification({ message, topic });
    })
  );
