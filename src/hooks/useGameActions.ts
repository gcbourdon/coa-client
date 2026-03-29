import { useCallback } from 'react'
import type {
  PlayCardPayload,
  MoveConquerorPayload,
  InitiateCombatPayload,
  AssignDefendersPayload,
  UseAbilityPayload,
  PlaySpellPayload,
} from '../types/game'
import {
  ACTION_END_TURN,
  ACTION_PLAY_CARD,
  ACTION_MOVE_CONQUEROR,
  ACTION_INITIATE_COMBAT,
  ACTION_ASSIGN_DEFENDERS,
  ACTION_USE_ABILITY,
  ACTION_PLAY_SPELL,
  ACTION_PASS_PRIORITY,
} from '../constants/messageTypes'

type SendFn = (type: string, payload: object) => void

export function useGameActions(sendAction: SendFn) {
  const endTurn = useCallback(() => {
    sendAction(ACTION_END_TURN, {})
  }, [sendAction])

  const playCard = useCallback((payload: PlayCardPayload) => {
    sendAction(ACTION_PLAY_CARD, payload)
  }, [sendAction])

  const moveConqueror = useCallback((payload: MoveConquerorPayload) => {
    sendAction(ACTION_MOVE_CONQUEROR, payload)
  }, [sendAction])

  const initiateCombat = useCallback((payload: InitiateCombatPayload) => {
    sendAction(ACTION_INITIATE_COMBAT, payload)
  }, [sendAction])

  const assignDefenders = useCallback((payload: AssignDefendersPayload) => {
    sendAction(ACTION_ASSIGN_DEFENDERS, payload)
  }, [sendAction])

  const useAbility = useCallback((payload: UseAbilityPayload) => {
    sendAction(ACTION_USE_ABILITY, payload)
  }, [sendAction])

  const playSpell = useCallback((payload: PlaySpellPayload) => {
    sendAction(ACTION_PLAY_SPELL, payload)
  }, [sendAction])

  const passPriority = useCallback(() => {
    sendAction(ACTION_PASS_PRIORITY, {})
  }, [sendAction])

  return { endTurn, playCard, moveConqueror, initiateCombat, assignDefenders, useAbility, playSpell, passPriority }
}
