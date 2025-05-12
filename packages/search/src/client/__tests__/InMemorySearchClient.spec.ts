import { InMemorySearchClient } from '../InMemorySearchClient';

type User = {
  id: string;
  name: string;
  email: string;
  age: number;
  address: {
    street: string;
  };
};

describe('client/InMemorySearchClient', () => {
  const client = new InMemorySearchClient<User>(['name', 'email', 'address.street']);

  afterEach(async () => {
    await client.flush();
  });

  it('should add items to the search index', async () => {
    await client.add([
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

    const results = await client.search('John');

    expect(results).toHaveLength(1);
  });

  it('should add items to the search index', async () => {
    const users = Array.from({ length: 1000 }, (_, i) => ({
      id: `${i}`,
      name: `John Doe ${i}`,
      email: '',
      age: 0,
      address: {
        street: `${i}`,
      },
    }));
    await client.add(users);

    const results = await client.search('Doe 1');

    expect(results).toHaveLength(10);
  });

  it('should remove items from the search index', async () => {
    await client.add([
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
    const pre = await client.search('John');
    await client.remove('1');

    const post = await client.search('John');
    expect(pre).toHaveLength(1);
    expect(post).toHaveLength(0);
  });

  it('should flush out data', async () => {
    await client.add([
      {
        id: '1',
        name: 'John Doe',
        email: '',
        age: 0,
        address: {
          street: '',
        },
      },
      {
        id: '2',
        name: 'John Marcus',
        email: '',
        age: 0,
        address: {
          street: '',
        },
      },
    ]);
    const pre = await client.search('John');
    await client.flush();
    const post = await client.search('John');
    expect(pre).toHaveLength(2);
    expect(post).toHaveLength(0);
  });
});
