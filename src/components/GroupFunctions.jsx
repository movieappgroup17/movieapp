import { useState, useContext } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'  // to notify user after login or signup
import 'react-toastify/dist/ReactToastify.css';

// Create new group function
    const createGroup = async (groupname, description, ownerid) => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/groups`, {
                groupname,
                description,
                ownerid
            })
            toast.success('Group created successfully!')
            return response.data
        } catch (error) {
            console.error(error)
            toast.error('Error creating group!')
        }
    }
    
    // Get all groups function
    const getGroups = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/groups`)
            return response.data
        } catch (error) {
            console.error(error)
            toast.error('Error fetching groups')
            return []
        }
    }

    // Delete group function
    const deleteGroup = async (groupid) => {
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/groups/${groupid}`)
            toast.success('Group deleted successfully!')
        } catch (error) {
            console.error(error)
            toast.error('Error deleting group!')
        }
    }

    // Get group by id function
    const getGroupById = async (groupid) => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/groups/${groupid}`)
            return response.data
        } catch (error) {
            console.error(error)
            toast.error('Error while fetching group')
            return null
        }
    }

    // Check if user is member of group
    const checkIsGroupMember = async (groupid, userid) => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/groups/${groupid}/members/${userid}`)
            return response.data.isMember
        } catch (error) {
            console.error(error)
            return false
        }
    }

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

    export { sendJoinReq, rejectRequest, acceptRequest, createGroup, getGroups, getGroupById, deleteGroup, checkIsGroupMember }