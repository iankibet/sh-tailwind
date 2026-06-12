export const startCase = (value) =>
    String(value ?? '')
        .replace(/[_-]+/g, ' ')
        .replace(/([a-z\d])([A-Z])/g, '$1 $2')
        .trim()
        .split(/\s+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')

export const randomId = (prefix = 'sh') =>
    `${prefix}-${Math.random().toString(36).slice(2, 9)}`
