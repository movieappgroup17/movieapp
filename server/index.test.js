import { expect } from "chai"
import { initializeTestDb, insertTestUser, getToken, addTestReview, addTestMovie } from "./helper/test.js"
import sinon from "sinon"
import { performLogout } from '../src/utils/logout.js'
import { getAllReviews } from "./controller/reviewController.js"

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
    // failed user is stated as an object
    const failUser = {email: "test.user@test.com", password: "password123", nickname: "Nickname3"}
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

    it("should NOT sign up, password is invalid", async () => {
        // send POST request to the server
        const response = await fetch("http://localhost:3001/user/signup", {
            method: "post",
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify({ user: failUser })
        })

        const data = await response.json()  // parse server response as JSON

        // it should not sign up, because password does not have a upcase letter
        expect(response.status).to.equal(400)   // check response status is 400
    })

    it("should NOT sign up, email / nickname are already registered", async () => {
        // send POST request to the server
        const response = await fetch("http://localhost:3001/user/signup", {
            method: "post",
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify({ user: newUser })
        })

        const data = await response.json()  // parse server response as JSON

        // it should not sign up, because nickname/email are already registered to an another user
        expect(response.status).to.equal(409)   // check response status is 409
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

    it('should NOT sign in, no email/password is submitted', async () => {
        // send POST request to the server
        const response = await fetch("http://localhost:3001/user/signin", {
            method: "post",
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify({ user: {email: "", password: ""} })
        })
        const data = await response.json()  // parse server response as JSON
        // it should not sign in, because email/password are missing
        expect(response.status).to.equal(400)   // check response status is 400
        expect(data.error.message).to.equal('Email and password are required') // check error message

    })

    it("should NOT sign in, user is not registered", async () => {
        // send POST request to the server
        const response = await fetch("http://localhost:3001/user/signin", {
            method: "post",
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify({ user: {email: "testfail.user@test.com", password: "Password987"} })
        })
        const data = await response.json()  // parse server response as JSON

        expect(response.status).to.equal(404)   // check response status is 404
        expect(data.error.message).to.equal('User not found') // check error message
    })

    it("should NOT sign in, user has wrong password", async () => {
                // send POST request to the server
        const response = await fetch("http://localhost:3001/user/signin", {
            method: "post",
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify({ user: {email: "test.user@test.com", password: "Password987"} })
        })
        const data = await response.json()  // parse server response as JSON
        // should not sign in, because user´r password is wrong
        expect(response.status).to.equal(401)   // check response status is 401
        expect(data.error.message).to.equal('Invalid password') // check error message

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
        //console.log(sessionStorage.getItem('user'))
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

// testing reviews
describe("Testing browsing reviews", () => {  

    const firstMovie = {
            movieID: 8587,
            title: "The Lion King",
            date: "1994-06-15",
            text: "Young lion prince Simba, eager to one day become king of the Pride Lands, grows up under the watchful eye of his father Mufasa; all the while his villainous uncle Scar conspires to take the throne for himself. Amid betrayal and tragedy, Simba must confront his past and find his rightful place in the Circle of Life.",
            imageURL: "/sKCr78MXSLixwmZ8DyJLrpMsd15.jpg"
        }

        const secondMovie = {
            movieID: 14160,
            title: "Up",
            date: "1994-06-15",
            text: "Carl Fredricksen spent his entire life dreaming of exploring the globe and experiencing life to its fullest. But at age 78, life seems to have passed him by, until a twist of fate (and a persistent 8-year old Wilderness Explorer named Russell) gives him a new lease on life.",
            imageURL: "/mFvoEwSfLqbcWwFsDjQebn9bzFe.jpg"
        }
        const firstReview = {
            movieID: 8587,
            userID: 2,
            stars: 3,
            text: "It was OK"
        }
        const secondReview = {
            movieID: 14160,
            userID: 2,
            stars: 5,
            text: "Best movie ever!!!"
        }

    before( async () => {
        
        try {
            // add test movies and reviews to the database
            await addTestMovie(firstMovie)
            await addTestMovie(secondMovie)
            await addTestReview(firstReview)
            await addTestReview(secondReview)
        } catch (error) {
            console.error("Error inserting test data:", error)
            throw error
        }
        
    })

    // testing browsing reviews
    it("should get all reviews", async () => {
        // GET request to the server
        const response = await fetch("http://localhost:3001/reviews", {
            method: "get",
            headers: { "Accept": "application/json" }
        })
        const data = await response.json()  // parse server response as JSON
        expect(data.length).to.equal(2) // 2 reviews were added before testing, so it should return 2 objects
        expect(data[0]).to.include.all.keys(["movieid", "userid", "stars", "text"])  // check response contains all expected keys
        expect(data[1]).to.include.all.keys(["movieid", "userid", "stars", "text"])  // check response contains all expected keys
    })
})