export type Channel = {
  id: string;
  channel_name: string;
  created_at: string;
  role: "admin" | "member";
  invite_code: string;
};

export type Message = {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  username: string;
};

export type User = {
  id: string;
  email: string;
  username: string;
};

export type ChannelMember = {
  user_id: string;
  username: string;
  role: "admin" | "member";
};
