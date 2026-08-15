export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

export interface CurrentUserResponse {
  success: boolean;
  data: User;
}