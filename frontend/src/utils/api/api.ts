import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchWithAuth } from "../../utils/fetchWithAuth";
import type { Match, PaginatedMatches, PracticeMatch, Stats } from "../types";

const API_URL = import.meta.env.VITE_API_URL;

export const registerUser = async (username: string, password: string) => {
  try {
    const res = await fetch(`${API_URL}/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      if (res.status === 409 && errorData.error === "username_already_exists") {
        throw new Error("pages.login.usernameAlreadyExists");
      }
      if (res.status === 429 && errorData.error === "too_many_registration_attempts") {
        throw new Error("pages.login.tooManyRegistrationAttempts");
      }
      if (errorData.error === "weak_password") {
        throw new Error("pages.login.weakPassword");
      }
      if (errorData.error === "invalid_username") {
        throw new Error("pages.login.invalidUsername");
      }
      throw new Error("Registration failed");
    }
    return res.json();
  } catch (err: any) {
    if (err.message === "Failed to fetch" || err.name === "TypeError") {
      throw new Error("pages.login.networkError");
    }
    throw err;
  }
};

export const loginUser = async (username: string, password: string) => {
  try {
    const res = await fetch(`${API_URL}/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      if (errorData.error === "wrong_username_or_password") {
        throw new Error("pages.login.wrongUsernameOrPassword");
      }
      if (errorData.error === "too_many_attempts") {
        throw new Error("pages.login.tooManyAttempts");
      }
      throw new Error("Login failed");
    }
    return res.json();
  } catch (err: any) {
    if (err.message === "Failed to fetch" || err.name === "TypeError") {
      throw new Error("pages.login.networkError");
    }
    throw err;
  }
};

const fetchMatches = async (page: number, pageSize: number): Promise<PaginatedMatches<Match>> => {
  const res = await fetchWithAuth(`/matches/?page=${page}&page_size=${pageSize}`);
  if (!res.ok) throw new Error("Failed to fetch matches");
  return res.json();
};

export const useMatches = (page: number, pageSize: number) => {
  return useQuery<PaginatedMatches<Match>, Error>({
    queryKey: ["matches", page, pageSize],
    queryFn: () => fetchMatches(page, pageSize)
  });
};

const uploadMatch = async (match: Match[]): Promise<Match[]> => {
  const res = await fetchWithAuth("/matches/upload/", {
    method: "POST",
    body: JSON.stringify(match),
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) throw new Error("Failed to upload matches");

  return res.json();
};

export const useUploadMatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadMatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });
};

const deleteMatch = async (id: number): Promise<Match> => {
  const res = await fetchWithAuth("/matches/delete/", {
    method: "DELETE",
    body: JSON.stringify({ id: id }),
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to delete match");
  return res.json();
};

export const useDeleteMatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });
};

const fetchPracticeMatches = async (page: number, pageSize: number): Promise<PaginatedMatches<PracticeMatch>> => {
  const res = await fetchWithAuth(`/practice-matches/?page=${page}&page_size=${pageSize}`);
  if (!res.ok) throw new Error("Failed to fetch practice matches");
  return res.json();
};

export const usePracticeMatches = (page: number, pageSize: number) => {
  return useQuery<PaginatedMatches<PracticeMatch>, Error>({
    queryKey: ["practice-matches", page, pageSize],
    queryFn: () => fetchPracticeMatches(page, pageSize),
  });
};

const uploadPracticeMatch = async (match: PracticeMatch): Promise<PracticeMatch> => {
  const res = await fetchWithAuth("/practice-matches/upload/", {
    method: "POST",
    body: JSON.stringify(match),
  });

  if (!res.ok) throw new Error("Failed to upload match");

  return res.json();
};

export const useUploadPracticeMatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadPracticeMatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["practice-matches"] });
    },
  });
};

const deletePracticeMatch = async (id: number): Promise<PracticeMatch> => {
  const res = await fetchWithAuth("/practice-matches/delete/", {
    method: "DELETE",
    body: JSON.stringify({ id: id }),
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to delete practice match");
  return res.json();
};

export const useDeletePracticeMatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePracticeMatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["practice-matches"] });
    },
  });
};

const uploadStats = async (stats: Stats): Promise<Stats> => {
  const res = await fetchWithAuth("/stats/upload/", {
    method: "POST",
    body: JSON.stringify(stats),
  });

  if (!res.ok) throw new Error("Failed to upload stats");

  return res.json();
};

export const useUploadStats = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadStats,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches", "practice-matches"] });
    },
  });
};

const deleteStats = async () => {
  const res = await fetchWithAuth("/stats/delete/", {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Failed to delete stats");

  return null;
};

export const useDeleteStats = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteStats,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches", "practice-matches"] });
    },
  });
};
