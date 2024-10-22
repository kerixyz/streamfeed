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
    <div className="w-full max-w-2xl">
      <h2 className="text-2xl font-semibold text-deepNavy mb-4">Streamer Dashboard</h2>

      {/* User Versions Table */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-deepNavy mb-4">User Versions</h3>
        {userVersions.length > 0 ? (
          <table className="w-full bg-white shadow-md rounded-lg">
            <thead>
              <tr className="bg-primaryYellow text-deepNavy">
                <th className="px-4 py-2">User ID</th>
                <th className="px-4 py-2">Version</th>
                <th className="px-4 py-2">Streamer Name</th>
              </tr>
            </thead>
            <tbody>
              {userVersions.map((version) => (
                <tr key={version.user_id} className="border-t">
                  <td className="px-4 py-2">{version.user_id}</td>
                  <td className="px-4 py-2">{version.version}</td>
                  <td className="px-4 py-2">{version.streamer_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-deepNavy">No user versions found.</p>
        )}
      </div>

      {/* Chat Messages Table */}
      <div>
        <h3 className="text-xl font-semibold text-deepNavy mb-4">Chat Messages</h3>
        {chatMessages.length > 0 ? (
          <table className="w-full bg-white shadow-md rounded-lg">
            <thead>
              <tr className="bg-primaryYellow text-deepNavy">
                <th className="px-4 py-2">User ID</th>
                <th className="px-4 py-2">Message</th>
                <th className="px-4 py-2">Role</th>
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2">Streamer Name</th>
              </tr>
            </thead>
            <tbody>
              {chatMessages.map((message, index) => (
                <tr key={index} className="border-t">
                  <td className="px-4 py-2">{message.user_id}</td>
                  <td className="px-4 py-2">{message.message}</td>
                  <td className="px-4 py-2">{message.role}</td>
                  <td className="px-4 py-2">{message.category}</td>
                  <td className="px-4 py-2">{message.streamer_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-deepNavy">No chat messages found.</p>
        )}
      </div>
    </div>
  );
};

export default DashboardView;
