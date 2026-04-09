const UI_TIME_FORMATTER_24H = new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
})

export const formatUiTime24h = (value: string): string => {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
        return value
    }

    return UI_TIME_FORMATTER_24H.format(date)
}
