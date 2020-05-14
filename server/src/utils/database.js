import Pool from 'pg-pool';

const {
  DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD,
} = process.env;
console.log('Connecting to:', DB_DATABASE, 'on', DB_HOST, 'port', DB_PORT);
const pool = new Pool({
  user: DB_USERNAME,
  host: DB_HOST,
  database: DB_DATABASE,
  password: DB_PASSWORD,
  port: DB_PORT,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', JSON.stringify(err));
});

export const getPool = () => pool;

export const executeQuery = async ({ query, params = [] }) => {
  console.log('executing sql: ', query, params);
  let result;
  try {
    result = await pool.query(query.replace(/\s\s+/g, ' '), params);
  } catch (e) {
    console.error(`Error executing sql: ${e.message}`);
    throw e;
  }
  const { rows } = result;
  console.log('got', rows.length, 'results:', JSON.stringify(rows));
  return rows;
};

export const executeTransactionalQuery = async ({ client, query, params = [] }) => {
  console.log('executing sql: ', query, params);
  let result;
  try {
    result = await client.query(query.replace(/\s\s+/g, ' '), params);
  } catch (e) {
    console.error(`Error executing sql: ${e.message}`);
    throw e;
  }
  const { rows } = result;
  console.log('got', rows.length, 'results:', JSON.stringify(rows));
  return rows;
};
