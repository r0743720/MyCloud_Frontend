import AuthService from "./AuthService";

const getLastest = () => {
    return fetch (process.env.NEXT_PUBLIC_API_URL + "/api/sensors/latest", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${AuthService.getToken()}`,
        },
    });
};

const getHistory = (hours: number = 24) => {
    return fetch(
        process.env.NEXT_PUBLIC_API_URL + `/api/sensors/history?hours=${hours}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${AuthService.getToken()}`,
            },
        }
    );
};

const getAlerts = (hours: number = 24) => {
    return fetch(
        process.env.NEXT_PUBLIC_API_URL + `/api/sensors/alerts?hours=${hours}`,{
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${AuthService.getToken()}`,
            },
        }
    );
};

const controlFan = (on: boolean) => {
    return fetch(process.env.NEXT_PUBLIC_API_URL + "/api/fan/control", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${AuthService.getToken()}`,
        },
        body: JSON.stringify({ on }),
    });
};

const SensorService = { getLastest, getHistory, getAlerts, controlFan};
export default SensorService;