export const connect = async () => {
  console.log('connecting....');
  return {
    statusCode: 200,
    body: JSON.stringify({status: 'OK'}),
  };
};
