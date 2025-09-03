"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css"

export function SimpleCalendar({ date, setValue }) {
  return (
    <DayPicker
      mode="single"
      selected={date}
      onSelect={(day) => setValue("date", day)}
      initialFocus
      disabled={(day) =>
        day > new Date() || day < new Date("1990-01-01")
      }
    />
  )
}
