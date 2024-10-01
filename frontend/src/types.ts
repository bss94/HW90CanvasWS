export interface Coordinates {
  x: number;
  y: number;
  color: string;
}
export interface IncomingMessage {
  type: string;
  payload: Coordinates[];
}