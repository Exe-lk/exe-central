import { NextResponse } from 'next/server';

export function jsonEnvelope(data: any, meta?: any) {
  return {
    success: true,
    data,
    ...(meta !== undefined ? { meta } : {}),
  };
}

export function jsonEnvelopeError(message: string, details?: any) {
  return {
    success: false,
    error: message,
    ...(details !== undefined ? { details } : {}),
  };
}

export function jsonSuccess(data: any, status: number = 200, meta?: any) {
  return NextResponse.json(jsonEnvelope(data, meta), { status });
}

export function jsonError(message: string, status: number = 400, details?: any) {
  return NextResponse.json(jsonEnvelopeError(message, details), { status });
}
