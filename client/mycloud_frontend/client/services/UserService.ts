import AuthService from "./AuthService";

const getAll = () => {
  return fetch(process.env.NEXT_PUBLIC_API_URL + "/api/users", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AuthService.getToken()}`,
    },
  });
};

const createUser = (username: string, password: string, role: string, quotaBytes: number) => {
  return fetch(process.env.NEXT_PUBLIC_API_URL + "/api/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AuthService.getToken()}`,
    },
    body: JSON.stringify({ username, password, role, quotaBytes: quotaBytes.toString() }),
  });
};

const deleteUser = (id: number) => {
  return fetch(process.env.NEXT_PUBLIC_API_URL + `/api/users/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${AuthService.getToken()}` },
  });
};

const updateQuota = (id: number, quotaBytes: number) => {
  return fetch(process.env.NEXT_PUBLIC_API_URL + `/api/users/${id}/quota`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AuthService.getToken()}`,
    },
    body: JSON.stringify({ quotaBytes }),
  });
};

const UserService = { getAll, createUser, deleteUser, updateQuota };
export default UserService;