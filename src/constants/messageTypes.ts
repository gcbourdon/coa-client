// Client → Server action types
export const ACTION_JOIN_GAME = 'JOIN_GAME' as const
export const ACTION_END_TURN = 'END_TURN' as const
export const ACTION_PLAY_CARD = 'PLAY_CARD' as const
export const ACTION_MOVE_CONQUEROR = 'MOVE_CONQUEROR' as const
export const ACTION_INITIATE_COMBAT = 'INITIATE_COMBAT' as const
export const ACTION_ASSIGN_DEFENDERS = 'ASSIGN_DEFENDERS' as const
export const ACTION_USE_ABILITY = 'USE_ABILITY' as const
export const ACTION_PLAY_SPELL = 'PLAY_SPELL' as const
export const ACTION_PASS_PRIORITY = 'PASS_PRIORITY' as const

// Server → Client event types
export const EVENT_GAME_STATE = 'GAME_STATE' as const
export const EVENT_ACTION_REJECTED = 'ACTION_REJECTED' as const
export const EVENT_COMBAT_RESULT = 'COMBAT_RESULT' as const
export const EVENT_GAME_OVER = 'GAME_OVER' as const
export const EVENT_WAITING_FOR_DEFENDERS = 'WAITING_FOR_DEFENDERS' as const
