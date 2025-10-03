import { useState, useEffect, useContext } from 'react'
import Header from '../components/Header'
import { useParams, useNavigate } from 'react-router-dom'
import { UserContext } from '../context/UserContext'
import { toast } from 'react-toastify'

export default function GroupPage() {
    const [group, setGroup] = useState(null)
    const { id } = useParams()
    const navigate = useNavigate()
    const { getGroupById, deleteGroup, checkIsGroupMember } = useContext(UserContext)
    const isLoggedIn = sessionStorage.getItem('user')
    
    useEffect(() => {
        fetchGroup()
    }, [id])
    
    const fetchGroup = async () => {
        const groupData = await getGroupById(id)
        setGroup(groupData)
        
        const userFromStorage = JSON.parse(sessionStorage.getItem('user'))
        if (userFromStorage) {
            const isOwner = groupData.ownerid === userFromStorage.userid
            const memberStatus = await checkIsGroupMember(id, userFromStorage.userid)
            
            if (!isOwner && !memberStatus) {
                toast.error('You are not a member of this group')
                navigate('/groups')
            }
        }
    }
    
    const handleDeleteGroup = () => {
        const userFromStorage = JSON.parse(sessionStorage.getItem('user'))
        if (userFromStorage.userid !== group.ownerid) {
            alert('Only owner can delete this group!')
            return
        }
        if (window.confirm('Are you sure you want to delete this group?')) {
            deleteGroup(id)
            navigate('/groups')
        }
    }
    
    if (!group) return null
    
    return (
        <>
            <Header pageTitle={group.groupname} />
            <div>
                <h2>{group.groupname}</h2>
                <p>Owner: {group.owner}</p>
                <p>{group.description}</p>
                {isLoggedIn && (
                    <>
                        <button onClick={handleDeleteGroup}>Delete this group</button>
                        <button onClick={() => navigate('/groups')}>Back to groups</button>
                    </>
                )}
            </div>
        </>
    )
}