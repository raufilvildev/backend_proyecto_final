interface PrivateMessage {
  id: number;
  uuid: string;
  sender_id: number;
  receiver_id: number;
  content: string;
  sent_at: string;
  updated_at: string;
}
