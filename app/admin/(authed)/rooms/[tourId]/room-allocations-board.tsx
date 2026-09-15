'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import type { DragEvent } from 'react'
import {
  assignPassengerToRoom,
  autoAllocateRooms,
  createRoomAllocation,
  deleteRoomAllocation,
  renameRoomAllocation,
} from '../../../../actions/admin'
import { ROOM_CAPACITY, cap, RoomType } from '../../../../lib/booking'

export type PassengerCard = {
  id: string
  name: string
  personType: 'adult' | 'infant'
  reservationCode: string
  leadName: string
}

export type RoomCard = {
  id: string
  label: string
  capacity: number
  members: PassengerCard[]
}

type ByType = Record<RoomType, { rooms: RoomCard[]; unassigned: PassengerCard[] }>

const ROOM_TYPES: RoomType[] = ['quad', 'triple', 'double']
const UNASSIGNED = '__unassigned__'

export default function RoomAllocationsBoard({
  tourId,
  byType,
}: {
  tourId: string
  byType: ByType
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const totalUnassigned = ROOM_TYPES.reduce((s, t) => s + byType[t].unassigned.length, 0)
  const totalAssigned = ROOM_TYPES.reduce(
    (s, t) => s + byType[t].rooms.reduce((rs, r) => rs + r.members.length, 0),
    0
  )
  const hasAnyone = totalUnassigned + totalAssigned > 0

  function onAutoSuggest() {
    if (
      totalAssigned > 0 &&
      !confirm(
        'Re-running auto-suggest clears every current room assignment (including any you moved by hand) and redistributes everyone from scratch. Continue?'
      )
    ) {
      return
    }
    setError(null)
    startTransition(async () => {
      const r = await autoAllocateRooms(tourId)
      if (r.ok) router.refresh()
      else setError(r.error ?? 'Something went wrong.')
    })
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-xl border border-stone-200 p-4">
        <div>
          <p className="text-sm font-semibold text-stone-900">Auto-suggest everyone</p>
          <p className="text-xs text-stone-500 mt-0.5">
            Fills every bed type at once, keeping people from the same booking together where they fit.
            Once allocated, drag anyone to a different room to fine-tune — or re-run this to reset and
            reshuffle everyone again.
          </p>
        </div>
        <button
          onClick={onAutoSuggest}
          disabled={isPending || !hasAnyone}
          className="text-xs font-semibold bg-[#C4A348] text-white rounded-full px-4 py-2 hover:bg-[#b2932e] transition disabled:opacity-50 shrink-0"
        >
          {isPending
            ? 'Working…'
            : totalAssigned > 0
            ? 'Re-run auto-suggest'
            : `Auto-suggest (${totalUnassigned} unassigned)`}
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>
      )}

      {ROOM_TYPES.map(type => (
        <RoomTypeSection key={type} tourId={tourId} roomType={type} data={byType[type]} />
      ))}
    </div>
  )
}

function RoomTypeSection({
  tourId,
  roomType,
  data,
}: {
  tourId: string
  roomType: RoomType
  data: { rooms: RoomCard[]; unassigned: PassengerCard[] }
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [busyAction, setBusyAction] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [newRoomLabel, setNewRoomLabel] = useState('')
  const [showNewRoom, setShowNewRoom] = useState(false)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null)

  const capacity = ROOM_CAPACITY[roomType]

  function run(id: string, fn: () => Promise<{ ok: boolean; error?: string }>) {
    setBusyAction(id)
    setError(null)
    startTransition(async () => {
      const r = await fn()
      setBusyAction(null)
      if (r.ok) router.refresh()
      else setError(r.error ?? 'Something went wrong.')
    })
  }

  function onCreateRoom() {
    const label = newRoomLabel.trim()
    if (!label) return
    run('new-room', async () => {
      const r = await createRoomAllocation(tourId, roomType, label)
      if (r.ok) {
        setNewRoomLabel('')
        setShowNewRoom(false)
      }
      return r
    })
  }

  function onAssign(passengerId: string, roomAllocationId: string) {
    run(`assign-${passengerId}`, async () =>
      assignPassengerToRoom(passengerId, roomAllocationId || null)
    )
  }

  function onUnassign(passengerId: string) {
    run(`assign-${passengerId}`, async () => assignPassengerToRoom(passengerId, null))
  }

  function onRename(roomId: string, label: string) {
    run(`rename-${roomId}`, async () => renameRoomAllocation(roomId, label))
  }

  function onDeleteRoom(roomId: string) {
    if (!confirm('Delete this room? Anyone assigned to it will become unassigned.')) return
    run(`delete-${roomId}`, async () => deleteRoomAllocation(roomId))
  }

  function handleDragStart(passengerId: string) {
    return (e: DragEvent<HTMLLIElement>) => {
      e.dataTransfer.setData('text/plain', passengerId)
      e.dataTransfer.effectAllowed = 'move'
      setDraggingId(passengerId)
    }
  }

  function handleDragEnd() {
    setDraggingId(null)
    setDragOverTarget(null)
  }

  function canDropOn(room: RoomCard): boolean {
    if (!draggingId) return true
    const alreadyHere = room.members.some(m => m.id === draggingId)
    return alreadyHere || room.members.length < room.capacity
  }

  function handleDragOverRoom(room: RoomCard) {
    return (e: DragEvent<HTMLDivElement>) => {
      if (!canDropOn(room)) return
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
      setDragOverTarget(room.id)
    }
  }

  function handleDropOnRoom(room: RoomCard) {
    return (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setDragOverTarget(null)
      const passengerId = e.dataTransfer.getData('text/plain') || draggingId
      if (!passengerId) return
      onAssign(passengerId, room.id)
    }
  }

  function handleDragOverUnassigned(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverTarget(UNASSIGNED)
  }

  function handleDropOnUnassigned(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragOverTarget(null)
    const passengerId = e.dataTransfer.getData('text/plain') || draggingId
    if (!passengerId) return
    onUnassign(passengerId)
  }

  function handleDragLeave(target: string) {
    return () => setDragOverTarget(prev => (prev === target ? null : prev))
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-stone-900">
          {cap(roomType)} rooms
          <span className="ml-2 text-xs font-normal text-stone-400">
            {data.rooms.length} {data.rooms.length === 1 ? 'room' : 'rooms'} · {capacity} per room
          </span>
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewRoom(v => !v)}
            className="text-xs font-semibold bg-white border border-stone-300 text-stone-700 rounded-full px-3 py-1.5 hover:border-stone-400 transition"
          >
            + New room
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>
      )}

      {showNewRoom && (
        <div className="flex items-center gap-2">
          <input
            value={newRoomLabel}
            onChange={e => setNewRoomLabel(e.target.value)}
            placeholder={`e.g. ${cap(roomType)} Room ${data.rooms.length + 1}`}
            className="text-sm rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-stone-400"
          />
          <button
            onClick={onCreateRoom}
            disabled={isPending || !newRoomLabel.trim()}
            className="text-xs font-semibold bg-stone-900 text-white rounded-full px-3 py-1.5 hover:bg-stone-800 transition disabled:opacity-50"
          >
            {busyAction === 'new-room' ? 'Adding…' : 'Add'}
          </button>
        </div>
      )}

      {data.rooms.length === 0 ? (
        <p className="text-sm text-stone-500 bg-white rounded-xl border border-stone-200 p-4">
          No rooms yet.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.rooms.map((room, index) => (
            <RoomCardView
              key={room.id}
              room={room}
              number={index + 1}
              busyAction={busyAction}
              draggingId={draggingId}
              isDragOver={dragOverTarget === room.id}
              onDragStartPassenger={handleDragStart}
              onDragEndPassenger={handleDragEnd}
              onDragOver={handleDragOverRoom(room)}
              onDragLeave={handleDragLeave(room.id)}
              onDrop={handleDropOnRoom(room)}
              onUnassign={onUnassign}
              onRename={onRename}
              onDelete={onDeleteRoom}
            />
          ))}
        </div>
      )}

      {data.unassigned.length > 0 && (
        <div
          onDragOver={handleDragOverUnassigned}
          onDragLeave={handleDragLeave(UNASSIGNED)}
          onDrop={handleDropOnUnassigned}
          className={`mt-2 rounded-xl transition ${
            dragOverTarget === UNASSIGNED ? 'ring-2 ring-[#C4A348] ring-offset-2' : ''
          }`}
        >
          <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
            Unassigned ({data.unassigned.length}) — drag here to remove from a room
          </h3>
          <ul className="bg-white rounded-xl border border-stone-200 divide-y divide-stone-100">
            {data.unassigned.map(p => {
              const openRooms = data.rooms.filter(r => r.members.length < r.capacity)
              return (
                <li
                  key={p.id}
                  draggable
                  onDragStart={handleDragStart(p.id)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center justify-between gap-3 px-4 py-2.5 text-sm cursor-grab active:cursor-grabbing ${
                    draggingId === p.id ? 'opacity-40' : ''
                  }`}
                >
                  <span className="text-stone-900">
                    {p.name}
                    {p.personType === 'infant' && <span className="ml-1 text-xs text-stone-500">(infant)</span>}
                    <span className="ml-2 text-xs text-stone-400 font-mono">{p.reservationCode}</span>
                  </span>
                  <select
                    defaultValue=""
                    disabled={isPending || openRooms.length === 0}
                    onChange={e => e.target.value && onAssign(p.id, e.target.value)}
                    className="text-xs rounded-lg border border-stone-200 bg-white px-2 py-1.5 focus:outline-none disabled:opacity-50"
                  >
                    <option value="" disabled>
                      {openRooms.length === 0 ? 'No rooms with space' : 'Assign to room…'}
                    </option>
                    {openRooms.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.label} ({r.members.length}/{r.capacity})
                      </option>
                    ))}
                  </select>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </section>
  )
}

function RoomCardView({
  room,
  number,
  busyAction,
  draggingId,
  isDragOver,
  onDragStartPassenger,
  onDragEndPassenger,
  onDragOver,
  onDragLeave,
  onDrop,
  onUnassign,
  onRename,
  onDelete,
}: {
  room: RoomCard
  number: number
  busyAction: string | null
  draggingId: string | null
  isDragOver: boolean
  onDragStartPassenger: (passengerId: string) => (e: DragEvent<HTMLLIElement>) => void
  onDragEndPassenger: () => void
  onDragOver: (e: DragEvent<HTMLDivElement>) => void
  onDragLeave: () => void
  onDrop: (e: DragEvent<HTMLDivElement>) => void
  onUnassign: (passengerId: string) => void
  onRename: (roomId: string, label: string) => void
  onDelete: (roomId: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [label, setLabel] = useState(room.label)
  const full = room.members.length >= room.capacity

  function save() {
    const trimmed = label.trim()
    if (!trimmed || trimmed === room.label) {
      setEditing(false)
      setLabel(room.label)
      return
    }
    onRename(room.id, trimmed)
    setEditing(false)
  }

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`rounded-xl border bg-white p-4 flex flex-col gap-2.5 transition ${
        isDragOver ? 'border-[#C4A348] ring-2 ring-[#C4A348] ring-offset-2' : 'border-stone-200'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="shrink-0 w-5 h-5 rounded-full bg-stone-900 text-white text-[10px] font-bold flex items-center justify-center">
            {number}
          </span>
          {editing ? (
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <input
                value={label}
                onChange={e => setLabel(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && save()}
                autoFocus
                className="text-sm font-semibold rounded-lg border border-stone-200 bg-white px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
              <button onClick={save} className="text-xs text-[#C4A348] font-semibold shrink-0">
                Save
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="font-semibold text-stone-900 text-sm hover:text-[#C4A348] transition truncate text-left"
            >
              {room.label}
            </button>
          )}
        </div>
        <span
          className={`text-xs font-semibold rounded-full px-2 py-0.5 shrink-0 ${
            full ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'
          }`}
        >
          {room.members.length}/{room.capacity}
        </span>
      </div>

      <ul className="flex flex-col gap-1.5 min-h-[1.5rem]">
        {room.members.length === 0 ? (
          <li className="text-xs text-stone-400">Drop someone here</li>
        ) : (
          room.members.map(m => (
            <li
              key={m.id}
              draggable
              onDragStart={onDragStartPassenger(m.id)}
              onDragEnd={onDragEndPassenger}
              className={`flex items-center justify-between gap-2 text-sm cursor-grab active:cursor-grabbing ${
                draggingId === m.id ? 'opacity-40' : ''
              }`}
            >
              <span className="text-stone-700 truncate">
                {m.name}
                {m.personType === 'infant' && <span className="ml-1 text-xs text-stone-500">(infant)</span>}
                <span className="ml-1.5 text-xs text-stone-400 font-mono">{m.reservationCode}</span>
              </span>
              <button
                onClick={() => onUnassign(m.id)}
                disabled={busyAction === `assign-${m.id}`}
                className="text-xs text-stone-400 hover:text-red-600 transition shrink-0"
              >
                Remove
              </button>
            </li>
          ))
        )}
      </ul>

      <button
        onClick={() => onDelete(room.id)}
        disabled={busyAction === `delete-${room.id}`}
        className="text-xs text-stone-400 hover:text-red-600 transition self-start mt-1"
      >
        Delete room
      </button>
    </div>
  )
}
