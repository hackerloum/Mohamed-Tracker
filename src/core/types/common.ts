export type IsoTimestamp = string;
export type IsoDateTime = IsoTimestamp;
export type LocalDate = string;
export type IanaTimezone = string;
export type IanaTimeZone = IanaTimezone;
export type MonthKey = string;
export type ClockTime = string;
/** Integer Tanzanian shillings. Never a float. */
export type TzsAmount = number;

export interface BaseRecord {
  id: string;
  userId: string;
  createdAt: IsoTimestamp;
  updatedAt: IsoTimestamp;
}

export type OwnedRecord = BaseRecord;

export interface DatedRecord extends BaseRecord {
  localDate: LocalDate;
  timezone: IanaTimezone;
}
