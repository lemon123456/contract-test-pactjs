const path = require('path');
const chai = require('chai');
const Pact = require('@pact-foundation/pact').Pact;
const chaiAsPromised = require('chai-as-promised');
const request = require('superagent');

const expect = chai.expect;
const MOCK_SERVER_PORT = 8080;

chai.use(chaiAsPromised);

describe('Pact', () => {
  const provider = new Pact({
    consumer: 'TodoApp',
    provider: 'TodoService',
    host: '127.0.0.1',
    port: MOCK_SERVER_PORT,
    log: path.resolve(process.cwd(), 'logs', 'pact.log'),
    dir: path.resolve(process.cwd(), 'pacts'),
    logLevel: 'INFO',
    spec: 2
  });

  before(() => provider.setup())

  context('when there is matched user', () => {
    before(() => {
      return provider.addInteraction({
        state: 'have a matched user',
        uponReceiving: 'a request for get user',
        withRequest: {
          method: 'GET',
          path: '/user/1',
          headers: { 'Accept': 'application/json' }
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: {
            id: 1,
            name: 'God'
          }
        }
      });
    });

    it('should response with user with id and name', (done) => {
      request.get(`http://localhost:${MOCK_SERVER_PORT}/user/1`)
        .then((response) => {
          const user = response.body;
          expect(user.name).to.equal('God');
          done();
        })
        .catch((e) => {
          done(e);
        });
    });

    // Verify in success/fail case above that the pact expectations
    // were met. Makes the flow of your `it` block simpler
    afterEach(() => {
      return provider.verify();
    });

    after(() => {
      provider.finalize();
    });
  })
});