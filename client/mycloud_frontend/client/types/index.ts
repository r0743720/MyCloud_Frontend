export type Role = "ADMIN" | "USER";

export type LoggedInUser = {
  token: string;
  username: string;
  role: Role;
};

export type FileItem = {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
  updatedAt: string;
};

export type StorageStats = {
  totalBytes: number;
  usedBytes: number;
  freeBytes: number;
  totalFiles: number;
  byFileType: Record<string, number>;
  bytesByFileType: Record<string, number>;
};

export type DuplicateFile = {
  id: number;
  fileName: string;
  sizeBytes: number;
  fileType: string;
};

export type DuplicateGroup = {
  baseName: string;
  count: number;
  wastedBytes: number;
  files: DuplicateFile[];
};

export type SensorReading = {
  id: number;
  temperature: number;
  humidity: number;
  pressure: number;
  timestamp: string;
};

export type MovementAlert = {
  id: number;
  accelerationX: number;
  accelerationY: number;
  accelerationZ: number;
  timestamp: string;
};

export type StatusMessage = {
  message: string;
  type: "error" | "success";
};
