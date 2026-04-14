-- Migration to add missing columns to the chamas table
ALTER TABLE chamas ADD COLUMN IF NOT EXISTS target_goal_sats BIGINT DEFAULT 0;
ALTER TABLE chamas ADD COLUMN IF NOT EXISTS max_members INTEGER DEFAULT 100;
ALTER TABLE chamas ADD COLUMN IF NOT EXISTS member_count INTEGER DEFAULT 1;

-- Verification query
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'chamas' 
AND column_name IN ('target_goal_sats', 'max_members', 'member_count');
