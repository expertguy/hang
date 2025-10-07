import React, { useEffect, useState } from 'react'
import {  useNavigate } from 'react-router-dom'
import ApiFunction from '../../utils/api/apiFuntions';
import { useSelector } from 'react-redux';
import { decryptData } from '../../utils/api/encrypted';
import { Spinner } from 'react-bootstrap';

// Add this utility function at the top of your file or import from utils
const formatWhatsAppTime = (timestamp) => {
  if (!timestamp) return '';
  
  const messageDate = new Date(timestamp);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const messageDateOnly = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate());
  
  // Check if it's today
  if (messageDateOnly.getTime() === today.getTime()) {
    return messageDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }
  
  // Check if it's yesterday
  if (messageDateOnly.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  }
  
  // Check if it's within the last 7 days
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  if (messageDateOnly > weekAgo) {
    return messageDate.toLocaleDateString('en-US', { weekday: 'long' });
  }
  
  // For older messages, show date
  return messageDate.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: '2-digit'
  });
};

const PersonalChatList = () => {
    const { post } = ApiFunction();
    const encryptedToken = useSelector(state => state.appData?.userToken);
    const userToken = decryptData(encryptedToken);
    const [chatUsers, setChatUsers] = useState([]); // Fixed: Initialize as array
    // const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    useEffect(() => {
        const getChatUsers = async () => {
            const data = {
                type: "get_user_conversations",
                user_id: userToken
            }
            setLoading(true);
            await post('', data)
                .then(res => {
                    if (res?.result && Array.isArray(res?.conversations)) {
                        setChatUsers(res?.conversations)
                    } else {
                        setChatUsers([]) // Fallback to empty array
                    }
                })
                .catch(err => {
                    console.log("there is an error fetching chat users =>", err);
                    setChatUsers([]); // Set empty array on error
                })
                .finally(() => {
                    setLoading(false);
                })
        }
        getChatUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userToken])
    
    return (
        <>
            {/* <div className='chatFilterGroup my-4'>
                <button onClick={() => setChatFilter('all')} className={`chatFilter ${chatFilter === 'all' && 'active'}`}>All</button>
                <button onClick={() => setChatFilter('unread')} className={`chatFilter ${chatFilter === 'unread' && 'active'}`}>Unread</button>
                <button onClick={() => setChatFilter('read')} className={`chatFilter ${chatFilter === 'read' && 'active'}`}>Read Only</button>
            </div> */}
            <div className='private_message_group my-4'>
                {loading ? <>
                    <div className='h-100 w-full flex items-center justify-center'>
                        <Spinner animation="border" variant="primary" />
                    </div>
                </> : <>
                    {chatUsers?.map((value, index) => {
                        // Return empty if type is not 'personal'
                        if (value?.type !== 'personal') {
                            return null;
                        }
                        return (
                            <button onClick={() => navigate(`/private/${value?.id}`,{state:{otherUser:value?.other_user}})} className='' key={index}>
                                <div className="ChatList" >
                                    <div className='relative'>
                                        <img src={value?.other_user?.image} alt="" />
                                    </div>
                                    <div className='w-full'>
                                        <div className='flex items-center justify-between'>
                                            <h1 className='britti_medium fs_16'>{value?.other_user?.name ?? "Ava Nomad"}</h1>
                                            <span className='fs_14 txt_grey'>
                                                {formatWhatsAppTime(value?.last_message_time)}
                                            </span>
                                        </div>
                                        <p className='mb-0 txt_grey text-clamp-1 text-start max-w-[90%]'>{value?.last_message}</p>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </>}
            </div>
        </>
    )
}

export default PersonalChatList