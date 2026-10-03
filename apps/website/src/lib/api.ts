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

const handleResponse = (r: Response) => {
  if (r.ok) {
    return r.json();
  }
  return r.json().then((d) => Promise.reject(new Error(d.message)));
};

const listUsers = async (filter?: { type: "contractor" | "supplier" }) => {
  const search = filter ? `?access=${filter.type}` : "";
  return fetch(`/api/users${search}`, withAuth()).then(handleResponse);
};

const listContracts = async () => {
  return fetch(`/api/contracts`, withAuth()).then(handleResponse);
};

const getContract = async (id: string) => {
  return fetch(`/api/contracts/${id}`, withAuth()).then(handleResponse);
};

const endContract = async (id: string) => {
  const [userId, rateId] = id.split("_");
  return fetch(
    `/api/users/${userId}/rates/${rateId}`,
    withAuth({
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: false }),
    }),
  ).then(handleResponse);
};

const getUser = async (id: string = "current") => {
  return fetch(`/api/users/${id}`, withAuth()).then(handleResponse);
};

const updateUser = async (user: Record<string, unknown>, id: string = "current") => {
  return fetch(
    `/api/users/${id}`,
    withAuth({
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    }),
  ).then(handleResponse);
};

const getUnsentQuests = async () => {
  return fetch(`/api/users/current/quests/unsent`, withAuth()).then(handleResponse);
};

const getUserTransactions = async (userId?: string | number) => {
  const path = userId === undefined ? "/api/users/current/transactions" : `/api/users/${userId}/transactions`;
  return fetch(path, withAuth()).then(handleResponse);
};

const listRates = async (userId?: string | number) => {
  const path = userId === undefined ? "/api/users/current/rates" : `/api/users/${userId}/rates`;
  return fetch(path, withAuth()).then(handleResponse);
};

const createRate = async (rate: Record<string, unknown>) => {
  return fetch(
    `/api/users/current/rates`,
    withAuth({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rate),
    }),
  ).then(handleResponse);
};

const updateRate = async (id: string, rate: Record<string, unknown>) => {
  return fetch(
    `/api/users/current/rates/${id}`,
    withAuth({
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rate),
    }),
  ).then(handleResponse);
};

const deleteRate = async (id: string) => {
  return fetch(`/api/users/current/rates/${id}`, withAuth({ method: "DELETE" })).then(handleResponse);
};

const createGroup = async (label: string, rates: string[] = []) => {
  return fetch(
    `/api/users/current/groups`,
    withAuth({
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, rates }),
    }),
  ).then(handleResponse);
};

const deleteGroup = async (id: string) => {
  return fetch(`/api/users/current/groups/${id}`, withAuth({ method: "DELETE" })).then(handleResponse);
};

const api = {
  getUser,
  getUnsentQuests,
  admin: {
    setUserAccess: (id: string, access: "contractor" | "supplier" | "member") => {
      return updateUser({ access }, id);
    },
  },
  contract: {
    list: listContracts,
    get: getContract,
    end: endContract,
  },
  user: {
    list: listUsers,
    get: getUser,
    update: updateUser,
    getUnsentQuests,
    transactions: {
      list: getUserTransactions,
    },
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
