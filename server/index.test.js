import { expect } from "chai"
import { initializeTestDb, insertTestUser, getToken } from "./helper/test.js"

/*describe("Testing database", () => {
    let token = null
    const testUser = { email: "testUser@test.com", password: "password123"}
    before(()=> {
        initializeTestDb()
        token = getToken(testUser)
    })
})*/

// before testing initializes test database
before(()=> {
    initializeTestDb()
})

// Testing for user management
describe("Testing user management", () => {

    // first test user is inserted to database
    const user = { email: "test2@test.com", password: "password123", nickname: "Nickname2" }
    before(() => {
        insertTestUser(user)
    })

    // testing signing up
    it("should sign up", async () => {
        // new user is stated as an object
        const newUser = {email: "test.user@test.com", password: "password123", nickname: "Nickname1"}

        // tries to sign up new user
        const response = await fetch("http://localhost:3001/user/signup", {
            method: "post",
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify({ user: newUser })
        })
        const data = await response.json()
        expect(response.status).to.equal(201)
        expect(data).to.include.all.keys(["userid", "email", "nickname"])
        expect(data.email).to.equal(newUser.email)
        expect(data.nickname).to.equal(newUser.nickname)
    })

    // testing signing in
    it('should sign in', async () => {
        const response = await fetch("http://localhost:3001/user/signin", {
            method: "post",
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify({ user })
        })
        const data = await response.json()
        expect(response.status).to.equal(200)
        expect(data).to.include.all.keys(["userid", "email", "token"])
        expect(data.email).to.equal(user.email)
    })

})