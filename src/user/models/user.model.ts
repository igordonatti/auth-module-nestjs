export interface User {
  id: string;
  email: string;
  password?: string; // Optional, as it should not be exposed
  resetToken?: string;
}
