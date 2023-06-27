const request = require("supertest");
const chai = require("chai");
const expect = chai.expect;
const app = require("../../../serverConfig/server");

describe("API Tests", () => {
    beforeEach(async function () {});

    describe("API Route: Authentication [ /api/auth ]", () => {
        describe("/nonce", () => {
            it("When conditions are met, nonce are emitted.", (done) => {
                request(app)
                    .get("/api/auth/nonce")
                    .expect(200)
                    .end((err, res) => {
                        if (err) return done(err);
                        // Add your assertions here based on the response
                        // For example, check if the response body has a nonce property
                        expect(res.body).to.have.property("nonce");
                        done();
                    });
            });

            it("Limited number of nonces can be emitted to avoid server overload.", (done) => {});
        });

        describe("/authenticate", () => {
            it("Only emitted nonces can be used.", (done) => {});
            it("Non authenticated users can't access any auth required endpoint.", (done) => {});
        });
    });

    describe("API Route: Change Stats [ /api/changeStats ]", () => {
        describe("/requestChange", () => {
            it("Auth user calls it in the way it should be called.", (done) => {});
            it("Auth user tries to call it with wrong data types.", (done) => {});

            it("Auth user tries to call it with already used payment.", (done) => {});
            it("Auth user tries to call it with not owned address.", (done) => {});
        });

        it("/allowURIChange", (done) => {
            it("Auth user calls it in the way it should be called.", (done) => {});
            it("Auth user tries to call it with wrong data types.", (done) => {});
            it("Auth user tries to call it with already used payment.", (done) => {});
            it("Auth user tries to call it with not owned address.", (done) => {});
            it("Auth user tries to call it with not owned NFT.", (done) => {});
            it("Auth user tries to call it with not owned randomness request ID.", (done) => {});
        });
    });
});
