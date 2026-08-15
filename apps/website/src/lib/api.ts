const createAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) return {};

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

const withAuth = (init: RequestInit = {}): RequestInit => {
  const authHeaders = createAuthHeaders().headers ?? {};
  return {
    ...init,
    headers: {
      ...(init.headers instanceof Headers ? Object.fromEntries(init.headers.entries()) : (init.headers ?? {})),
      ...authHeaders,
    },
  };
};

const listUsers = async (filter?: { type: "contractor" | "supplier" }) => {
  const search = filter ? `?type=${filter.type}` : "";
  return fetch(`/api/users${search}`, withAuth()).then((r) => r.json());
};

const listContracts = async () => {
  return fetch(`/api/contracts`, withAuth()).then((r) => r.json());
};

const getUser = async (id: string = "current") => {
  return fetch(`/api/users/${id}`, withAuth()).then((r) => r.json());
};

const getUnsentQuests = async () => {
  return fetch(`/api/users/current/quests/unsent`, withAuth()).then((r) => r.json());
};

const listRates = async (userId?: string | number) => {
  const path = userId === undefined ? "/api/users/current/rates" : `/api/users/${userId}/rates`;
  return fetch(path, withAuth()).then((r) => r.json());
};

const createRate = async (rate: Record<string, unknown>) => {
  return fetch(
    `/api/users/current/rates`,
    withAuth({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rate),
    }),
  ).then((r) => r.json());
};

const updateRate = async (id: string, rate: Record<string, unknown>) => {
  return fetch(
    `/api/users/current/rates/${id}`,
    withAuth({
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rate),
    }),
  ).then((r) => r.json());
};

const deleteRate = async (id: string) => {
  return fetch(`/api/users/current/rates/${id}`, withAuth({ method: "DELETE" })).then((r) => r.json());
};

const createGroup = async (label: string, rates: string[] = []) => {
  return fetch(
    `/api/users/current/groups`,
    withAuth({
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, rates }),
    }),
  ).then((r) => r.json());
};

const deleteGroup = async (id: string) => {
  return fetch(`/api/users/current/groups/${id}`, withAuth({ method: "DELETE" })).then((r) => r.json());
};

const api = {
  getUser,
  getUnsentQuests,
  contract: {
    list: listContracts,
  },
  user: {
    list: listUsers,
    get: getUser,
    getUnsentQuests,
    rates: {
      list: listRates,
      create: createRate,
      update: updateRate,
      delete: deleteRate,
    },
    groups: {
      create: createGroup,
      delete: deleteGroup,
    },
  },
};

export default api;
