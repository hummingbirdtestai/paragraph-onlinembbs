/*
  # Fix battle chat RPC to return inserted row

  1. Changes
    - Drop existing `insert_battle_chat_message` RPC
    - Recreate it to return the inserted row
    - This eliminates race conditions when fetching the message after insert
    - Client will receive the exact DB row with real ID, timestamps, etc.

  2. Security
    - No changes to RLS policies
    - Function still validates user authentication
*/

DROP FUNCTION IF EXISTS insert_battle_chat_message(uuid, text, text);

CREATE FUNCTION insert_battle_chat_message(
  p_battle_id uuid,
  p_user_name text,
  p_message text
)
RETURNS TABLE (
  id uuid,
  battle_id uuid,
  user_id uuid,
  user_name text,
  message text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO battle_group_messages (
    battle_id,
    user_id,
    user_name,
    message
  )
  VALUES (
    p_battle_id,
    auth.uid(),
    p_user_name,
    p_message
  )
  RETURNING 
    battle_group_messages.id,
    battle_group_messages.battle_id,
    battle_group_messages.user_id,
    battle_group_messages.user_name,
    battle_group_messages.message,
    battle_group_messages.created_at;
END;
$$;