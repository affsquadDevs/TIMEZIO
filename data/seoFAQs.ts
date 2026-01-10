export function getConvertFAQs(from: string, to: string) {
  return [
    {
      question: `What is the time difference between ${from} and ${to}?`,
      answer: `The time difference between ${from} and ${to} varies depending on daylight saving time (DST) observance. Use the interactive globe above to see the current offset and how it changes throughout the year.`,
    },
    {
      question: `Does ${from} observe daylight saving time?`,
      answer: `${from} may observe daylight saving time, which affects the time difference with ${to}. Our converter automatically accounts for DST changes and shows the current status in real-time.`,
    },
    {
      question: `How accurate is the ${from} to ${to} time conversion?`,
      answer: `Our time converter uses official IANA timezone data and is accurate to the minute. All conversions automatically adjust for daylight saving time changes and current offset rules.`,
    },
    {
      question: `Can I convert times for future dates?`,
      answer: `Yes. Use the date selector in the Compare tab above to see how the time difference between ${from} and ${to} changes on any future date, accounting for upcoming DST transitions.`,
    },
  ];
}

export function getTimeCityFAQs(cityName: string) {
  return [
    {
      question: `What time is it in ${cityName} right now?`,
      answer: `The current local time in ${cityName} is displayed above on the interactive globe. Times update in real-time and automatically adjust for daylight saving time.`,
    },
    {
      question: `Does ${cityName} observe daylight saving time?`,
      answer: `${cityName}'s DST status is shown above. Use the DST tab to see when clocks change and how this affects the time throughout the year.`,
    },
    {
      question: `What is the UTC offset for ${cityName}?`,
      answer: `The current UTC offset for ${cityName} is displayed above. This offset may change during the year due to daylight saving time observance.`,
    },
  ];
}

export function getMeetingFAQs(cityA: string, cityB: string) {
  return [
    {
      question: `What are the best meeting times between ${cityA} and ${cityB}?`,
      answer: `Use the Planner tab above to find overlap hours between ${cityA} and ${cityB}. The planner shows working hours that work for both cities and avoids early morning or late night times when possible.`,
    },
    {
      question: `How do I schedule a meeting across ${cityA} and ${cityB}?`,
      answer: `Add both ${cityA} and ${cityB} as participants in the Planner tab, set your preferred working hours, and select a date. The planner will show available time slots that work for both locations.`,
    },
    {
      question: `Does daylight saving time affect meeting times between ${cityA} and ${cityB}?`,
      answer: `Yes. DST changes can shift the time difference between ${cityA} and ${cityB} by one hour. Our planner automatically accounts for these changes when showing available meeting times.`,
    },
  ];
}

export function getDSTFAQs(regionName: string) {
  return [
    {
      question: `Does ${regionName} observe daylight saving time?`,
      answer: `The current DST status for ${regionName} is shown above. Use the DST tab to see detailed information about when clocks change and the dates for current and upcoming transitions.`,
    },
    {
      question: `When does daylight saving time start and end in ${regionName}?`,
      answer: `DST start and end dates for ${regionName} vary by year and region. Check the DST tab above for the exact dates of the next transitions and how they affect local time.`,
    },
    {
      question: `How does DST affect time differences with other regions?`,
      answer: `Daylight saving time changes can alter time differences between ${regionName} and other regions by one hour. Our tools automatically account for these changes when comparing times or scheduling meetings.`,
    },
  ];
}

