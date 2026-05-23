import AuthService from "./AuthService";

const getStats = () => {
    return fetch(process.env.NEXT_PUBLIC_API_URL + "/api/dashboard/storage", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${AuthService.getToken()}`,
        },
    });
};

const StorageService = { getStats };
export default StorageService;