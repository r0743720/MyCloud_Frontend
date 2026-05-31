import AuthService from "./AuthService";

const getAll = () => {
    return fetch(process.env.NEXT_PUBLIC_API_URL + "/api/files", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${AuthService.getToken()}`,
        },
    });
};

const upload = (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return fetch(process.env.NEXT_PUBLIC_API_URL + "/api/files/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${AuthService.getToken()}`},
        body: formData,
    });
};

const download = (id: number, fileName: string) => {
    return fetch(process.env.NEXT_PUBLIC_API_URL + `/api/files${id}/download`,{
        method: "GET",
        headers: { Authorization: `Bearer ${AuthService.getToken()}`},
    }).then((res) => res.blob()).then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
    });
};

const rename = (id: number, fileName: string) => {
    return fetch(process.env.NEXT_PUBLIC_API_URL + `/api/files/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${AuthService.getToken()}`,
        },
        body: JSON.stringify({ filename: fileName}),
    });
};

const remove = (id: number) => {
    return fetch(process.env.NEXT_PUBLIC_API_URL + `/api/files/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${AuthService.getToken()}`},
    });
};

const getDuplicates = () => {
    return fetch(process.env.NEXT_PUBLIC_API_URL + "/api/dashboard/duplicates", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${AuthService.getToken()}`,
        },
    });
};

const FileService = { getAll, upload, download, rename, remove, getDuplicates};

export default FileService;