const firstNames = ['Alice', 'Bob', 'Carol', 'David', 'Esther', 'Frank', 'Grace', 'Hosea', 'Irene', 'James', 'Karen', 'Leon', 'Mary', 'Noah', 'Olive', 'Peter', 'Quinn', 'Ruth', 'Sam', 'Tina']
const lastNames = ['Wanjiku', 'Otieno', 'Achieng', 'Kibet', 'Mwangi', 'Njoroge', 'Omar', 'Cherono', 'Barasa', 'Mutua']
const roles = ['Admin', 'Editor', 'Viewer', 'Manager']
const statuses = ['active', 'inactive', 'pending']

export const demoUsers = Array.from({ length: 47 }, (_, i) => {
    const first = firstNames[i % firstNames.length]
    const last = lastNames[i % lastNames.length]
    return {
        id: i + 1,
        name: `${first} ${last}`,
        email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
        amount: Math.round((Math.random() * 90000 + 1000) * 100) / 100,
        role: roles[i % roles.length],
        status: statuses[i % statuses.length],
        created_at: new Date(Date.now() - i * 86400000 * 3).toISOString()
    }
})
