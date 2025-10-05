import { useState, useEffect, useContext } from 'react'
import Header from '../components/Header'
import { UserContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import './css/Groups.css'

export default function Groups() {
  const [groups, setGroups] = useState([])
  const [groupname, setGroupname] = useState('')
  const [description, setDescription] = useState('')
  const navigate = useNavigate()
  const { user, createGroup, getGroups, deleteGroup, checkIsGroupMember } = useContext(UserContext)
  const isLoggedIn = sessionStorage.getItem('user')

  useEffect(() => {
    fetchGroups()
  }, [])

  const fetchGroups = async () => {
    const groupData = await getGroups()
    setGroups(groupData)
  }
  
  const handleCreateGroup = async (e) => {
    e.preventDefault()
    const userFromStorage = JSON.parse(sessionStorage.getItem('user'))
    await createGroup(groupname, description, userFromStorage.userid)
    setGroupname('')
    setDescription('')
    fetchGroups()
  }

  const handleDeleteGroup = async (groupid, ownerid) => {
    const userFromStorage = JSON.parse(sessionStorage.getItem('user'))
    if (userFromStorage.userid !== ownerid) {
      alert('Only owner can delete this group')
      return
    }
    if (window.confirm('Are you sure you want to delete your group?')) {
      await deleteGroup(groupid)
      fetchGroups()
    }
  }

  // check if user is part of group before navigating to group page
  const handleGroupClick = async (groupid, ownerid) => {
    const userFromStorage = JSON.parse(sessionStorage.getItem('user'))
    if (userFromStorage) {
      const isOwner = ownerid === userFromStorage.userid
      const memberStatus = await checkIsGroupMember(groupid, userFromStorage.userid)

      if (!isOwner && !memberStatus) {
        toast.error('You are not a member of this group!')
        return
      }
    }
    navigate(`/groups/${groupid}`)
  }

  return (
    <>
      <Header pageTitle={"Groups"}/>
      <div className="groups-container">
        {isLoggedIn && (
          <div className="create-group">
            <h3>Create new group</h3>
            <form onSubmit={handleCreateGroup}>
              <input type="text" placeholder="Group name" value={groupname} onChange={(e) => setGroupname(e.target.value)} required />
              <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
              <button type="submit">Create group</button>
            </form>  
          </div>
      )}

      <div className="groups-list">
        <h3>Groups</h3>
        {groups.length === 0 ? (
          <p>No groups found!</p>
        ) : (
          groups.map(group => (
            <div key={group.groupid} className="group-card">
              <h4 onClick={() => handleGroupClick(group.groupid, group.ownerid)}>
                {group.groupname}
              </h4>
              <p>Owner: {group.owner}</p>
              <p>{group.description}</p>
              {isLoggedIn && (
                <button onClick={() => handleDeleteGroup(group.groupid, group.ownerid)}>
                  Delete group
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
    </>
  )
}