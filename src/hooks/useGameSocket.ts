import { useEffect, useRef, useCallback } from 'react'
import { useGameStore } from '../store/gameStore'
import type { GameState, CombatResultPayload, ActionRejectedPayload, WaitingForDefendersPayload, GameOverPayload } from '../types/game'
import {
  ACTION_JOIN_GAME,
  EVENT_GAME_STATE,
  EVENT_ACTION_REJECTED,
  EVENT_COMBAT_RESULT,
  EVENT_GAME_OVER,
  EVENT_WAITING_FOR_DEFENDERS,
} from '../constants/messageTypes'

const WS_URL = import.meta.env.VITE_WS_URL ?? 'ws://localhost:8080'
const RECONNECT_DELAY_MS = 2000
const RECONNECT_MAX_MS = 30000

export function useGameSocket(gameId: string | null, playerId: string | null) {
  const socketRef = useRef<WebSocket | null>(null)
  const reconnectDelayRef = useRef(RECONNECT_DELAY_MS)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const unmountedRef = useRef(false)
  // Incremented each time we open a new connection. Each connection captures
  // its own ID so it can detect when it has been superseded (e.g. by React
  // StrictMode's double-mount) and avoid triggering a spurious reconnect.
  const connectionIdRef = useRef(0)

  const setGameState = useGameStore((s) => s.setGameState)
  const addLog = useGameStore((s) => s.addLog)
  const setLastCombatResult = useGameStore((s) => s.setLastCombatResult)
  const setLastRejection = useGameStore((s) => s.setLastRejection)

  const connect = useCallback(() => {
    if (!gameId || !playerId || unmountedRef.current) return

    const myId = ++connectionIdRef.current
    const ws = new WebSocket(`${WS_URL}/game/${gameId}`)
    socketRef.current = ws

    ws.onopen = () => {
      reconnectDelayRef.current = RECONNECT_DELAY_MS
      addLog('Connected to server.')
      ws.send(JSON.stringify({ type: ACTION_JOIN_GAME, payload: { gameId, playerId } }))
    }

    ws.onmessage = (event: MessageEvent) => {
      let msg: { type: string; payload: unknown }
      try {
        msg = JSON.parse(event.data as string)
      } catch {
        return
      }

      switch (msg.type) {
        case EVENT_GAME_STATE:
          setGameState(msg.payload as GameState)
          break

        case EVENT_ACTION_REJECTED: {
          const p = msg.payload as ActionRejectedPayload
          setLastRejection(p)
          addLog(`Rejected: ${p.message}`)
          break
        }

        case EVENT_COMBAT_RESULT: {
          const p = msg.payload as CombatResultPayload
          setLastCombatResult(p)
          addLog(
            `Combat: ${p.outgoingDamage} outgoing / ${p.returnDamage} return damage` +
            (p.destroyed.length ? ` — ${p.destroyed.length} destroyed` : '')
          )
          break
        }

        case EVENT_GAME_OVER: {
          const p = msg.payload as GameOverPayload
          addLog(`Game over! Player ${p.winner} wins. (${p.reason})`)
          break
        }

        case EVENT_WAITING_FOR_DEFENDERS: {
          const p = msg.payload as WaitingForDefendersPayload
          addLog(`Opponent is attacking — assign defenders (${p.timeoutMs / 1000}s).`)
          break
        }
      }
    }

    ws.onerror = () => {
      if (connectionIdRef.current !== myId) return
      addLog('WebSocket error.')
    }

    ws.onclose = () => {
      // Ignore if this connection has been superseded or the component unmounted.
      if (unmountedRef.current || connectionIdRef.current !== myId) return
      addLog(`Disconnected. Reconnecting in ${reconnectDelayRef.current / 1000}s…`)
      reconnectTimerRef.current = setTimeout(() => {
        reconnectDelayRef.current = Math.min(reconnectDelayRef.current * 2, RECONNECT_MAX_MS)
        connect()
      }, reconnectDelayRef.current)
    }
  }, [gameId, playerId, setGameState, addLog, setLastCombatResult, setLastRejection])

  useEffect(() => {
    unmountedRef.current = false
    connect()
    return () => {
      unmountedRef.current = true
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current)
      socketRef.current?.close()
    }
  }, [connect])

  const sendAction = useCallback((type: string, payload: object) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type, payload }))
    }
  }, [])

  return { sendAction }
}
