export interface ICurrentUser {
  user_id: string;
  email: string;
  full_name: string;
  tenant_id: string;
  ip: string;
  roles: string[];
}
