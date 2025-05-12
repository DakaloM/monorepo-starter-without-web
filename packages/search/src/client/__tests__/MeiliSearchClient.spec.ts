import { MeiliSearchClient } from '../MeiliSearchClient';

type User = {
  id: string;
  name: string;
  email: string;
  age: number;
  address: {
    street: string;
  };
};

describe.skip('client/MeiliSearchClient', () => {
  const searchClient = new MeiliSearchClient<User>('user');

  beforeAll(async () => {
    const a = await searchClient._client.createIndex('user', {
      primaryKey: 'id',
    });
  });
  afterEach(async () => {
    await searchClient._client.index('user').deleteAllDocuments();
  });

  it('should add items to the search index', async () => {
    await searchClient.add([
      {
        id: '1',
        name: 'John Doe',
        email: '',
        age: 0,
        address: {
          street: '',
        },
      },
    ]);

    const results = await searchClient.search('John');

    expect(results).toHaveLength(1);
  });

  it('should remove items from the search index', async () => {
    await searchClient.add([
      {
        id: '1',
        name: 'John Doe',
        email: '',
        age: 0,
        address: {
          street: '',
        },
      },
    ]);
    const pre = await searchClient.search('John');
    await searchClient.remove('1');

    const post = await searchClient.search('John');
    expect(pre).toHaveLength(1);
    expect(post).toHaveLength(0);
  });
});
