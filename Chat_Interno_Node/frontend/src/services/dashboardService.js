import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

export async function getDashboardSummary(token) {
  const response = await axios.get(
    `${API_URL}/api/dashboard/summary`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return response.data;
}
export async function getRoomsStatusChart(token) {
  const response = await axios.get(
    `${API_URL}/api/dashboard/rooms-status`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return response.data;
}
export async function getRoomsBySector(token) {
  const res = await axios.get(
    `${import.meta.env.VITE_API_URL}/api/dashboard/rooms-by-sector`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  return res.data;
}
export async function getMessagesOverTime(token, group = 'day') {
  const res = await axios.get(
    `${API_URL}/api/dashboard/messages-over-time?group=${group}`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return res.data;
}
export async function getTopCreators(token) {
  const res = await axios.get(
    `${API_URL}/api/dashboard/top-creators`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return res.data;
}
