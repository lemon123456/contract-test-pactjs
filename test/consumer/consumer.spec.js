const path = require('path');
const chai = require('chai');
const pact = require('pact');
const chaiAsPromised = require('chai-as-promised');
const request = require('superagent');

const expect = chai.expect;
const MOCK_SERVER_PORT = 8080;

chai.use(chaiAsPromised);

describe('Pact', () => {

    const provider = pact({
        consumer: 'TodoApp',
        provider: 'TodoService',
        host: 'localhost',
        port: MOCK_SERVER_PORT,
        log: path.resolve(process.cwd(), 'logs', 'pact.log'),
        dir: path.resolve(process.cwd(), 'pacts'),
        logLevel: 'INFO',
        spec: 2
    });

    context('when there is matched user', () => {
        before(() => {
            provider.setup()
                .then(() => {
                    provider.addInteraction({
                        state: 'have a matched user',
                        uponReceiving: 'a request for get user',
                        withRequest: {
                            method: 'GET',
                            path: '/user/1',
                            headers: {'Accept': 'application/json'}
                        },
                        willRespondWith: {
                            status: 200,
                            headers: {'Content-Type': 'application/json'},
                            body: {
                                id: 1,
                                name: 'God'
                            }
                        }
                    });

                })
        });

        it('should response with user with id and name', (done) => {
            request.get(`http://localhost:${MOCK_SERVER_PORT}/user/1`)
                .then((response) => {
                    const user = response.body;
                    expect(user.name).to.equal('God');
                    provider.verify();
                    done();
                })
                .catch((e) => {
                    console.log('error', e);
                    done(e);
                });
        });

        after(() => {
            provider.finalize();
        });
    })
});