export interface BoundedInterval {
  start: Date | number;
  end: Date | number;
}

export interface UnboundedInterval {
  start?: Date | number | null;
  end?: Date | number | null;
}

export type Interval = BoundedInterval | UnboundedInterval;
