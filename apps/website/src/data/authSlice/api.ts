const createAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) return {};

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};
const getUser = async (id: string = "current") => {
  return fetch(`/api/users/${id}`, { ...createAuthHeaders() }).then((r) => r.json());
};

const getUnsentQuests = async () => {
  return fetch(`/api/users/current/quests/unsent`, { ...createAuthHeaders() }).then((r) => r.json());
};

const createGroup = async (label: string, rates: string[] = []) => {
  return fetch(`/api/users/current/groups`, {
    method: "PUT",
    ...createAuthHeaders(),
    body: JSON.stringify({ label, rates }),
  }).then((r) => r.json());
};

const deleteGroup = async (id: string) => {
  return fetch(`/api/users/current/groups/${id}`, {
    method: "DELETE",
    ...createAuthHeaders(),
  }).then((r) => r.json());
};

const api = {
  getUser,
  getUnsentQuests,
  user: {
    get: getUser,
    getUnsentQuests,
    groups: {
      create: createGroup,
      delete: deleteGroup,
    },
  },
};

export default api;
