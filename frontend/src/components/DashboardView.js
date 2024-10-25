import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001/api';

const DashboardView = ({ streamer }) => {
  const [userVersions, setUserVersions] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);

  useEffect(() => {
    if (streamer) {
      fetchUserVersions();
      fetchChatMessages();
    }
  }, [streamer]);

  const fetchUserVersions = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/get-user-versions`, {
        params: { streamerName: streamer },
      });
      setUserVersions(response.data);
    } catch (error) {
      console.error('Error fetching user versions:', error);
    }
  };

  const fetchChatMessages = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/get-chat-messages`, {
        params: { streamerName: streamer },
      });
      setChatMessages(response.data.messages);
    } catch (error) {
      console.error('Error fetching chat messages:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-10 px-4 md:px-6 bg-white">
      <h2 className="text-3xl font-semibold mb-6">Streamer Dashboard</h2>
  
      {/* Chat Messages Table */}
      <div className="w-full max-w-4xl">
        <h3 className="text-2xl font-semibold mb-4">Chat Messages</h3>
        <div className="table-container max-h-64 overflow-x-auto">
          {chatMessages.length > 0 ? (
            <table className="w-full border-collapse bg-gray-100">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="px-4 py-2">User ID</th>
                  <th className="px-4 py-2">Message</th>
                  <th className="px-4 py-2">Role</th>
                </tr>
              </thead>
              <tbody>
                {chatMessages.map((message, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-4 py-2">{message.user_id}</td>
                    <td className="px-4 py-2 break-words">{message.message}</td>
                    <td className="px-4 py-2">{message.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500">No chat messages found.</p>
          )}
        </div>
      </div>
    </div>
  );
  
};  

export default DashboardView;
