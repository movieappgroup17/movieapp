import { useState, useContext } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'  // to notify user after login or signup
import 'react-toastify/dist/ReactToastify.css';

// function to send join request to group owner
const sendJoinReq = async (groupid, userid) => {
    console.log("groupfunctions userID: ", userid)
    try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/groups/joinreq`, {
                groupid,
                userid
            })
            toast.success("Join request sent")
            return response.data
    } catch (error) {
        console.error(error)
        if (error.response) {
            if(error.response.status === 409) {
                toast.error("You have already sent a join request to this group")
            } else {
                toast.error("Error sending request")
            }
        } else {
            toast.error("Network or server error")
        }  
    }        
}

// function to reject a request to join group
const rejectRequest = async (requestid) => {
    try {
        const response = await axios.patch(`${import.meta.env.VITE_API_URL}/groups/reject/${requestid}`)
        return response.data
    } catch (err) {
         console.error(err)   
    }
}

// function to accept a request to join group
const acceptRequest = async (requestid, groupid, userid) => {
    try {
        const response = await axios.patch(`${import.meta.env.VITE_API_URL}/groups/accept`, {
            requestid,
            groupid,
            userid
        })  
        return response.data
    } catch (err) {
        console.error(err)
    }
}

    export { sendJoinReq, rejectRequest, acceptRequest }