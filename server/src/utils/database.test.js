import Pool from 'pg-pool';

jest.mock('pg-pool', () => jest.fn().mockImplementation(() => ({
  on: jest.fn(),
  query: jest.fn(),
})));

describe('database', () => {
  const realConsole = global.console;
  let executeQuery;
  let executeTransactionalQuery;
  let getPool;
  beforeEach(async () => {
    global.console = {
      log: jest.fn(),
      error: jest.fn(),
    };
    ({ executeQuery, executeTransactionalQuery, getPool } = await import('./database'));
  });
  afterEach(() => {
    Pool.mockReset();
    global.console = realConsole;
  });
  describe('pool', () => {
    test('getPool returns pool', () => {
      const pool = getPool();
      // eslint-disable-next-line no-underscore-dangle
      expect(pool.on._isMockFunction).toBe(true);
      // eslint-disable-next-line no-underscore-dangle
      expect(pool.query._isMockFunction).toBe(true);
      expect(Pool).toHaveBeenCalledTimes(1);
      expect(Pool).toHaveBeenCalledWith({
        user: 'test_user',
        host: 'test_host',
        database: 'test_db',
        password: 'test_passwd',
        port: '666',
      });
      expect(console.log).toHaveBeenCalledWith(
        'Connecting to:', 'test_db', 'on', 'test_host', 'port', '666',
      );
    });
    test('on error writes to console', () => {
      const pool = getPool();
      expect(pool.on).toHaveBeenCalledTimes(1);
      expect(pool.on.mock.calls[0][0]).toBe('error');
      const fn = pool.on.mock.calls[0][1];
      fn({ message: 'bad things' });
      expect(console.error).toHaveBeenCalledWith('Unexpected error on idle client', '{"message":"bad things"}');
    });
  });

  describe('executeQuery', () => {
    test('executes and logs given query', async () => {
      const pool = getPool();
      pool.query.mockImplementation(async () => ({ rows: ['row1', 'row2'] }));
      const result = await executeQuery({ query: 'query to  execute', params: ['a', 'b'] });
      expect(console.log).toHaveBeenCalledWith('executing sql: ', 'query to  execute', ['a', 'b']);
      expect(pool.query).toHaveBeenCalledWith('query to execute', ['a', 'b']);
      expect(console.log).toHaveBeenCalledWith('got', 2, 'results:', '["row1","row2"]');
      expect(result).toEqual(['row1', 'row2']);
    });
    test('passes empty array when no params give', async () => {
      const pool = getPool();
      pool.query.mockImplementation(async () => ({ rows: ['row1', 'row2'] }));
      const result = await executeQuery({ query: 'query to  execute' });
      expect(console.log).toHaveBeenCalledWith('executing sql: ', 'query to  execute', []);
      expect(pool.query).toHaveBeenCalledWith('query to execute', []);
      expect(console.log).toHaveBeenCalledWith('got', 2, 'results:', '["row1","row2"]');
      expect(result).toEqual(['row1', 'row2']);
    });
    test('logs database errors', async () => {
      const pool = getPool();
      pool.query.mockRejectedValue(new Error('DB Error'));
      await expect(executeQuery({ query: 'query to  execute' })).rejects.toThrow('DB Error');
      expect(console.error).toHaveBeenCalledWith('Error executing sql: DB Error');
    });
  });

  describe('executeTransactionalQuery', () => {
    const mockClient = {
      query: jest.fn(),
    };

    afterEach(() => {
      mockClient.query.mockReset();
    });

    test('executes and logs given query', async () => {
      mockClient.query.mockImplementation(async () => ({ rows: ['row1', 'row2'] }));
      const result = await executeTransactionalQuery({ client: mockClient, query: 'query to  execute', params: ['a', 'b'] });
      expect(console.log).toHaveBeenCalledWith('executing sql: ', 'query to  execute', ['a', 'b']);
      expect(mockClient.query).toHaveBeenCalledWith('query to execute', ['a', 'b']);
      expect(console.log).toHaveBeenCalledWith('got', 2, 'results:', '["row1","row2"]');
      expect(result).toEqual(['row1', 'row2']);
    });
    test('passes empty array when no params give', async () => {
      mockClient.query.mockImplementation(async () => ({ rows: ['row1', 'row2'] }));
      const result = await executeTransactionalQuery({ client: mockClient, query: 'query to  execute' });
      expect(console.log).toHaveBeenCalledWith('executing sql: ', 'query to  execute', []);
      expect(mockClient.query).toHaveBeenCalledWith('query to execute', []);
      expect(console.log).toHaveBeenCalledWith('got', 2, 'results:', '["row1","row2"]');
      expect(result).toEqual(['row1', 'row2']);
    });
    test('logs database errors', async () => {
      mockClient.query.mockRejectedValue(new Error('DB Error'));
      await expect(executeTransactionalQuery({ client: mockClient, query: 'query to  execute' })).rejects.toThrow('DB Error');
      expect(console.error).toHaveBeenCalledWith('Error executing sql: DB Error');
    });
  });
});
