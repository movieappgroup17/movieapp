import { expect } from "chai"
import { initializeTestDb, insertTestUser, getToken } from "./helper/test.js"
import sinon from "sinon"
import { performLogout } from '../src/utils/logout.js'

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
    let user = { email: "test2@test.com", password: "Password123", nickname: "Nickname2" }
    // new user is stated as an object
    const newUser = {email: "test.user@test.com", password: "Password123", nickname: "Nickname1"}
    // token for account deletion
    let deleteToken

    before(() => {
        insertTestUser(user)    // insert testuser to database
    })

    // testing signing up
    it("should sign up", async () => {

        // send POST request to the server
        const response = await fetch("http://localhost:3001/user/signup", {
            method: "post",
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify({ user: newUser })
        })
        
        const data = await response.json()  // parse server response as JSON

        expect(response.status).to.equal(201)   // check response status is 201
        expect(data).to.include.all.keys(["userid", "email", "nickname"])   // check response contains all expected keys
        expect(data.email).to.equal(newUser.email) // check email matches the input data
        expect(data.nickname).to.equal(newUser.nickname) // check email matches the input data
    })

    // testing signing in
    it('should sign in', async () => {
        // send POST request to the server
        const response = await fetch("http://localhost:3001/user/signin", {
            method: "post",
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify({ user })
        })
        const data = await response.json()  // parse server response as JSON

        expect(response.status).to.equal(200)   // check response status is 200
        expect(data).to.include.all.keys(["userid", "email", "token"])  // check response contains all expected keys
        expect(data.email).to.equal(user.email) // check email matches the input data

        // save token for later deletion
        deleteToken = data.token
    })

    // testing account deletion
    it('should delete an account', async () => {
        // send DELETE request to the server
        const response = await fetch("http://localhost:3001/user/", {
            method: "delete",
            headers: { Authorization: `Bearer ${deleteToken}` }
        })
        expect(response.status).to.equal(204)   // check response status is 204
    })
})

// Frontend test
describe("Testing logout in Frontend", () => {

    // mock version of "setUser" -function and "toast" -object
    let setUser, toast

    beforeEach(() => {
    // create mock version of sessionStorage
    global.sessionStorage = {
        store: {},  // internal "memory", where key-value -pairs are stored

        // returns value to a given key
        getItem(key) {
            return this.store[key] || null
        },
        // sets value to a given key
        setItem(key, value) {
            this.store[key] = value.toString()
        },
        // removes a key
        removeItem(key) {
            delete this.store[key]
        },
        // clears whole mock version of sessionStorage
        clear() {
            this.store = {}
        }
  }
        // set testuser in mock version of sessionStorage
        sessionStorage.setItem("user", JSON.stringify({ email: 'test@testing.com', password: 'Password123', nickname: 'Nickname3', token: 'uSeRtOkEn123'}))
        setUser = sinon.spy() 
        toast = { success: sinon.spy()}
        // debug to check in console that user is set correctly
        console.log(sessionStorage.getItem('user'))
    })

    // testing logout
    // should remove user from sessionStorage, reset useState and show toast
    it('should logout', () => {
        // logout function is called with mock version of setUser and toast
        performLogout(setUser, toast)

        // check if sessionStorage is empty
        expect(sessionStorage.getItem("user")).to.be.null

        // check setUser is called once and with given values
        expect(setUser.calledOnce).to.be.true
        expect(setUser.firstCall.args[0]).to.deep.equal({
            email: '',
            password: '',
            nickname: '',
            token: ''
        })

        // check toast.success is called once and message includes "logged out"
        expect(toast.success.calledOnce).to.be.true
        expect(toast.success.firstCall.args[0]).to.include("logged out")
    })
})