const BASE_URL = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('cra_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (res) => {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const error = new Error(errorData.message || `Request failed with status ${res.status}`);
    error.status = res.status;
    error.data = errorData;
    throw error;
  }
  return res.json();
};

export const api = {
  // Auth
  async login(credentials) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return handleResponse(res);
  },

  async register(data) {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async getMe() {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getDemoUsers() {
    const res = await fetch(`${BASE_URL}/auth/demo-users`);
    return handleResponse(res);
  },

  async switchDemoUser(username) {
    const res = await fetch(`${BASE_URL}/auth/switch-demo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });
    return handleResponse(res);
  },

  async updateProfile(profileData) {
    const res = await fetch(`${BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(profileData),
    });
    return handleResponse(res);
  },

  async clearDemoReviewers() {
    const res = await fetch(`${BASE_URL}/auth/clear-demo-reviewers`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getUserProfile(username) {
    const res = await fetch(`${BASE_URL}/auth/profile/${username}`);
    return handleResponse(res);
  },

  // Reviews
  async getReviews(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/reviews${queryString ? `?${queryString}` : ''}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getReview(id) {
    const res = await fetch(`${BASE_URL}/reviews/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async createReview(data) {
    const res = await fetch(`${BASE_URL}/reviews`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await handleResponse(res);
    window.dispatchEvent(new CustomEvent('cra_notification_refresh'));
    return result;
  },

  async uploadVersion(reviewId, data) {
    const res = await fetch(`${BASE_URL}/reviews/${reviewId}/versions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await handleResponse(res);
    window.dispatchEvent(new CustomEvent('cra_notification_refresh'));
    return result;
  },

  async updateReviewStatus(reviewId, data) {
    const res = await fetch(`${BASE_URL}/reviews/${reviewId}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await handleResponse(res);
    window.dispatchEvent(new CustomEvent('cra_notification_refresh'));
    return result;
  },

  async rateReview(reviewId, data) {
    const res = await fetch(`${BASE_URL}/reviews/${reviewId}/rate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await handleResponse(res);
    window.dispatchEvent(new CustomEvent('cra_notification_refresh'));
    return result;
  },

  async assignReviewer(reviewId, reviewerId) {
    const res = await fetch(`${BASE_URL}/reviews/${reviewId}/assign`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ reviewerId }),
    });
    const result = await handleResponse(res);
    window.dispatchEvent(new CustomEvent('cra_notification_refresh'));
    return result;
  },

  // Comments
  async getComments(reviewId, versionNumber) {
    const query = versionNumber ? `?versionNumber=${versionNumber}` : '';
    const res = await fetch(`${BASE_URL}/reviews/${reviewId}/comments${query}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async addComment(reviewId, data) {
    const res = await fetch(`${BASE_URL}/reviews/${reviewId}/comments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await handleResponse(res);
    window.dispatchEvent(new CustomEvent('cra_notification_refresh'));
    return result;
  },

  async toggleResolveComment(commentId) {
    const res = await fetch(`${BASE_URL}/comments/${commentId}/resolve`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async deleteComment(commentId) {
    const res = await fetch(`${BASE_URL}/comments/${commentId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Reviewers
  async getMatchedReviewers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/reviewers/match${queryString ? `?${queryString}` : ''}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getLeaderboard() {
    const res = await fetch(`${BASE_URL}/reviewers/leaderboard`);
    return handleResponse(res);
  },

  // Notifications
  async getNotifications() {
    const res = await fetch(`${BASE_URL}/notifications`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async markNotificationRead(id) {
    const res = await fetch(`${BASE_URL}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async markAllNotificationsRead() {
    const res = await fetch(`${BASE_URL}/notifications/read-all`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Platform stats
  async getStatsOverview() {
    const res = await fetch(`${BASE_URL}/stats/overview`);
    return handleResponse(res);
  },
};
