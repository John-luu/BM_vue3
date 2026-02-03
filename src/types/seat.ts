// @/types/seat.ts
export interface AreaData {
  aid: number;
  rows: number;
  columns: number;
  areaName: string;
  subName: string;
}

export interface SeatData {
  sid: number;
  area?: number;
  row: number;
  column: number;
  type: SeatType;
  state: SeatState;
  show?: boolean;
}

export interface Position {
  row: number;
  column: number;
}

export type BatchPosition = Position;

export const SeatType = {
  CHAIR: 0,
  TABLE: 1,
} as const;

export const SeatState = {
  AVAILABLE: 0,
  OCCUPIED: 1,
  RESERVED: 2,
} as const;

// 类型定义
export type SeatType = (typeof SeatType)[keyof typeof SeatType];
export type SeatState = (typeof SeatState)[keyof typeof SeatState];

export interface AddSeatParams {
  row: number;
  column: number;
  area: number;
  type: SeatType;
}

export interface DeleteSeatParams {
  sid: number;
}

export interface BatchAddSeatsParams {
  area: number;
  type: SeatType;
  rows: BatchPosition[];
}
