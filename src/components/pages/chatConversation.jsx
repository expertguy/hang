import { RiMore2Line } from '@remixicon/react'
import React, { useEffect, useState, useRef } from 'react'
import { RiAddLine, RiArrowLeftLine, RiArrowUpLine, RiMapPinLine } from 'react-icons/ri'
import { Person } from '../icons/icons';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { decryptData } from '../../utils/api/encrypted';
import ApiFunction from '../../utils/api/apiFuntions';
import { Spinner } from 'react-bootstrap';

const ChatConversation = () => {
    // eslint-disable-next-line no-unused-vars
    const [message, setMessage] = useState('');
    const encryptedToken = useSelector(state => state?.appData?.userToken);
    const userToken = decryptData(encryptedToken);
    const checkIndata = useSelector(state => state.appData?.checkInData);
    const conversation_id = useParams()?.id;
    const encryptedUserData = useSelector(state => state.appData?.userData);
    const userData = decryptData(encryptedUserData);
        const [place_id, setPlaceId] = useState(null);
          useEffect(() => {
                setPlaceId(checkIndata?.place_id);
            }, [checkIndata]);
                const checkInStatus = useSelector(state => state.appData?.checkInStatus);
            
    const [loading, setLoading] = useState(false);
    // eslint-disable-next-line no-unused-vars
    const [upoadedImg, setUploadedImg] = useState('');
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [messages, setMessages] = useState([]);
    const { post } = ApiFunction();
    const [groupDetails, setGroupDetails] = useState(null);

    // Add ref for chat container
    const chatContainerRef = useRef(null);

    // Function to check if user is at bottom of chat
    const isUserAtBottom = () => {
        if (!chatContainerRef.current) return false;
        const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
        // Consider user "at bottom" if within 100px of the bottom
        return scrollHeight - scrollTop - clientHeight < 100;
    };

    // Function to scroll to bottom
    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    };

    const getMessages = async (shouldAutoScroll = false) => {
        const data = new FormData();
        data.append('type', 'get_conversation_messages');
        data.append('user_id', userToken);
        data.append('conversation_id', conversation_id);
        data.append('limit', 50);
        data.append('offset', 0);

        // Remember if user was at bottom before fetching new messages
        const wasAtBottom = isUserAtBottom();

        await post('', data)
            .then(res => {
                if (res?.result) {
                    setMessages(res?.messages || [])
                }
            })
            .catch(err => {
                console.log('the error on messages were => ', err);
            })
            .finally(() => {
                if (isInitialLoad || shouldAutoScroll || wasAtBottom) {
                    setTimeout(scrollToBottom, 100);
                }
                
                if (isInitialLoad) {
                    setIsInitialLoad(false);
                }
            })
    }

        useEffect(() => {
    
            const getGroupDetails = async () => {
    
                const data = {
                    type: 'get_group_conversation',
                    place_id: place_id
                }
    
                await post('', data)
                    .then(res => {
                        if (res) {
                            setGroupDetails(res);
                        } 
                    })
                    .catch(err => {
                        console.log("there is an error fetching groupDetails =>", err);
                    })
            }
    
    
    
            if (checkInStatus) {
                getGroupDetails();
            }
    
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [checkInStatus, place_id])

    useEffect(() => {
        // Initial load - always scroll to bottom
        getMessages(true);

        const interval = setInterval(() => {
            // Interval updates - only scroll if user is at bottom
            getMessages(false);
        }, 10000);

        // Cleanup interval on component unmount
        return () => {
            clearInterval(interval);
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversation_id, userToken])

    const sendMessage = async (msg_type = 'text', file = '') => {
        let msgdata = {
            type: 'send_conversation_message',
            user_id: userToken,
            conversation_id: conversation_id,
            content: message ?? "image",
            msg_type: msg_type
        }

       if (msg_type === 'image' && file) {
            const fileData = {
                name:file
            }
            const json = JSON.stringify(fileData);
            msgdata = {
                ...msgdata,
                attachments: json
            }
        }

        setLoading(true);
        await post('', msgdata)
            .then(res => {
                if (res.result) {
                    setMessage('');
                }
            })
            .catch(err => {
                console.log("err sending message ", err);
            })
            .finally(() => {
                // Always scroll to bottom after sending a message
                getMessages(true);
                setLoading(false);
            })
    }

    const imageUrlUplad = async (event) => {
        const fileData = event.target.files[0];
        const form = new FormData();
        form.append('type', 'upload_data');
        form.append('user_id', userToken);
        form.append('file', fileData);
        setLoading(true);
        await post('', form)
            .then(response => {
                if (response?.result || response?.url) {
                    const fileUrl = response?.url || response?.file_url || response?.image_url || '';
                    setUploadedImg(fileUrl);
                    // Send message with image attachment
                    sendMessage('image', fileUrl);
                }
            })
            .catch(err => {
                console.log("there is an error uploading the image the error is=>", err);
            })
            .finally(() => {
                setLoading(false);
            })
    }

    // Helper function to get image URL from attachments
    const getImageUrl = (msg) => {
        if (msg.attachments) {
            // If attachments is an object with name property
            if (typeof msg.attachments === 'object' && msg.attachments.name) {
                return msg.attachments.name;
            }
            // If attachments is a string (direct URL)
            if (typeof msg.attachments === 'string') {
                return msg.attachments;
            }
        }
        // Fallback to content if it contains an image URL
        if (msg.content && msg.content.includes('http')) {
            return msg.content;
        }
        return null;
    };

    // Helper function to render message content
    const renderMessageContent = (msg, isCurrentUser) => {
        const imageUrl = getImageUrl(msg);
        const hasImage = msg.type === 'image' && imageUrl;
        const hasContent = msg.content && msg.content.trim() && msg.content !== 'image';

        if (hasImage && hasContent) {
            // Show both image and text
            return (
                <div className="message-with-image">
                    <img 
                        src={imageUrl} 
                        alt="SharedImage" 
                        className="max-w-[200px] rounded mb-2" 
                    />
                    {isCurrentUser ? (
                        <span className="image-caption">{msg.content}</span>
                    ) : (
                        <h2 className="sender_text image-caption">{msg.content}</h2>
                    )}
                </div>
            );
        } else if (hasImage) {
            // Show only image
            return (
                <img 
                    src={imageUrl} 
                    alt="SharedImage" 
                    className="max-w-[200px] rounded" 
                />
            );
        } else {
            // Show only text
            return isCurrentUser ? (
                <span>{msg.content}</span>
            ) : (
                <h2 className="sender_text">{msg.content}</h2>
            );
        }
    };

    return (
        <>
            <div className='h_100vh'>
                <div className='chatHeader h-[89px] p-4 pb-3'>
                    <Link to={'/chat'}>
                        <RiArrowLeftLine className='w-[20px] h-[20px]' />
                    </Link>
                    <div className='h-[48px] w-[48px] flex items-center justify-center bg-[#4A8DFF1A] rounded-[12px]'><RiMapPinLine className='text-[#4A8DFF]' /></div>

                    <div>
                        <h1 className='britti_bold fs_16 text-[#0E121B]'>{checkIndata?.place_name}</h1>
                        <span className='fs_14 britti_light'>{groupDetails?.users?.length > 1 ? <>You and {groupDetails?.users?.length} person are here</> : <>Be the first one to start the conversation</>}</span>
                    </div>
                    <RiMore2Line className='ms-auto text-[#0E121B]' />
                </div>

                <div className='MainchatSection h_74vh p-4' ref={chatContainerRef}>
                    {Array.isArray(messages) && messages
                        .sort((a, b) => parseInt(a.id) - parseInt(b.id))
                        .map((msg) => {
                            const isCurrentUser = userData?.name === msg.name;

                            if (isCurrentUser) {
                                return (
                                    <div key={msg.id} className='chat_self'>
                                        {renderMessageContent(msg, true)}
                                    </div>
                                );
                            } else {
                                return (
                                    <div key={msg.id} className='chat_other'>
                                        <div className='sender mb-[7px]'>
                                            <img src={msg.user_image || Person} alt="" />
                                            <h1 className='mb-0'>{msg.name}</h1>
                                        </div>
                                        {renderMessageContent(msg, false)}
                                    </div>
                                );
                            }
                        })}
                </div>

                <div className='chatFooter p-4 pt-3'>
                    <button className='border border-[#E1E4EA]'>
                        <input type="file" accept="image/*" onChange={imageUrlUplad}  />
                        <RiAddLine className='w-[26px] h-[26px]' />
                    </button>
                    <div className='customInput'>
                        <input 
                            type="text" 
                            placeholder='Type a message...' 
                            onChange={(e) => setMessage(e.target.value)} 
                            value={message} 
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && !loading && message.trim()) {
                                    sendMessage();
                                }
                            }}
                        />
                    </div>
                    <button onClick={() => sendMessage()} className='bg_primary text-white' disabled={loading || !message.trim()}>
                        {loading ? <><Spinner animation="border" size="sm" variant="light" /></> : <RiArrowUpLine className='w-[26px] h-[26px]' />}
                    </button>
                </div>
            </div>
        </>
    )
}

export default ChatConversation